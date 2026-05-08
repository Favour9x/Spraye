'use client';

import { useState, useEffect } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';

export interface Notification {
  id: string;
  type: 'application' | 'selected' | 'rejected' | 'submitted' | 'transfer_requested' | 'transfer_confirmed' | 'approved' | 'disputed' | 'resolved';
  jobId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export function useNotifications(address?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const publicClient = usePublicClient();
  const { address: connectedAddress } = useAccount();

  // Load notifications from localStorage
  useEffect(() => {
    if (!address) return;

    const key = `archire-notifications-${address.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse notifications:', error);
      }
    }
  }, [address]);

  // Poll for new events every 30 seconds
  useEffect(() => {
    if (!address || !publicClient) return;

    const pollEvents = async () => {
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(1000); // Look back 1000 blocks

        // Get all relevant events
        const [
          applicationEvents,
          assignedEvents,
          submittedEvents,
          transferRequestedEvents,
          transferConfirmedEvents,
          approvedEvents,
          disputeRaisedEvents,
          disputeResolvedEvents
        ] = await Promise.all([
          publicClient.getLogs({
            address: ESCROW_CONTRACT.address,
            event: {
              type: 'event',
              name: 'JobApplicationSubmitted',
              inputs: [
                { type: 'uint256', indexed: true, name: 'jobId' },
                { type: 'address', indexed: true, name: 'freelancer' },
                { type: 'string', indexed: false, name: 'proposal' },
                { type: 'string', indexed: false, name: 'estimatedDelivery' }
              ]
            },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: ESCROW_CONTRACT.address,
            event: {
              type: 'event',
              name: 'FreelancerAssigned',
              inputs: [
                { type: 'uint256', indexed: true, name: 'jobId' },
                { type: 'address', indexed: true, name: 'freelancer' }
              ]
            },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: ESCROW_CONTRACT.address,
            event: {
              type: 'event',
              name: 'WorkSubmitted',
              inputs: [
                { type: 'uint256', indexed: true, name: 'jobId' },
                { type: 'string', indexed: false, name: 'deliverable' }
              ]
            },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: ESCROW_CONTRACT.address,
            event: {
              type: 'event',
              name: 'TransferRequested',
              inputs: [
                { type: 'uint256', indexed: true, name: 'jobId' }
              ]
            },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: ESCROW_CONTRACT.address,
            event: {
              type: 'event',
              name: 'TransferConfirmed',
              inputs: [
                { type: 'uint256', indexed: true, name: 'jobId' },
                { type: 'address', indexed: true, name: 'freelancer' },
                { type: 'string', indexed: false, name: 'imgurLink' }
              ]
            },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: ESCROW_CONTRACT.address,
            event: {
              type: 'event',
              name: 'JobApproved',
              inputs: [
                { type: 'uint256', indexed: true, name: 'jobId' },
                { type: 'address', indexed: true, name: 'freelancer' },
                { type: 'uint256', indexed: false, name: 'amount' }
              ]
            },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: ESCROW_CONTRACT.address,
            event: {
              type: 'event',
              name: 'DisputeRaised',
              inputs: [
                { type: 'uint256', indexed: true, name: 'jobId' },
                { type: 'address', indexed: true, name: 'raiser' }
              ]
            },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: ESCROW_CONTRACT.address,
            event: {
              type: 'event',
              name: 'DisputeResolved',
              inputs: [
                { type: 'uint256', indexed: true, name: 'jobId' },
                { type: 'address', indexed: true, name: 'arbitrator' },
                { type: 'address', indexed: true, name: 'recipient' },
                { type: 'uint256', indexed: false, name: 'amount' }
              ]
            },
            fromBlock,
            toBlock: 'latest'
          })
        ]);

        // Process events and create notifications
        const newNotifications: Notification[] = [];
        const existingIds = new Set(notifications.map(n => n.id));

        // Helper to create unique ID from event
        const createEventId = (eventName: string, jobId: bigint, blockNumber: bigint, logIndex: number) => {
          return `${eventName}-${jobId.toString()}-${blockNumber.toString()}-${logIndex}`;
        };

        // Process JobApplicationSubmitted events (for clients)
        for (const log of applicationEvents) {
          const { jobId, freelancer } = log.args;
          const eventId = createEventId('application', jobId!, log.blockNumber, log.logIndex!);
          
          if (!existingIds.has(eventId)) {
            // Fetch job to check if current user is the client
            const job = await publicClient.readContract({
              address: ESCROW_CONTRACT.address,
              abi: ESCROW_CONTRACT.abi,
              functionName: 'getJob',
              args: [jobId!]
            });

            if (job.client.toLowerCase() === address.toLowerCase()) {
              newNotifications.push({
                id: eventId,
                type: 'application',
                jobId: jobId!.toString(),
                message: `New application from ${freelancer?.slice(0, 6)}...${freelancer?.slice(-4)}`,
                timestamp: Date.now(),
                read: false
              });
            }
          }
        }

        // Process FreelancerAssigned events (for freelancers)
        for (const log of assignedEvents) {
          const { jobId, freelancer } = log.args;
          const eventId = createEventId('selected', jobId!, log.blockNumber, log.logIndex!);
          
          if (!existingIds.has(eventId) && freelancer?.toLowerCase() === address.toLowerCase()) {
            newNotifications.push({
              id: eventId,
              type: 'selected',
              jobId: jobId!.toString(),
              message: `You were selected for Job #${jobId!.toString()}!`,
              timestamp: Date.now(),
              read: false
            });
          }
        }

        // Process WorkSubmitted events (for clients)
        for (const log of submittedEvents) {
          const { jobId } = log.args;
          const eventId = createEventId('submitted', jobId!, log.blockNumber, log.logIndex!);
          
          if (!existingIds.has(eventId)) {
            const job = await publicClient.readContract({
              address: ESCROW_CONTRACT.address,
              abi: ESCROW_CONTRACT.abi,
              functionName: 'getJob',
              args: [jobId!]
            });

            if (job.client.toLowerCase() === address.toLowerCase()) {
              newNotifications.push({
                id: eventId,
                type: 'submitted',
                jobId: jobId!.toString(),
                message: `Work submitted for Job #${jobId!.toString()}`,
                timestamp: Date.now(),
                read: false
              });
            }
          }
        }

        // Process TransferRequested events (for freelancers)
        for (const log of transferRequestedEvents) {
          const { jobId } = log.args;
          const eventId = createEventId('transfer_requested', jobId!, log.blockNumber, log.logIndex!);
          
          if (!existingIds.has(eventId)) {
            const job = await publicClient.readContract({
              address: ESCROW_CONTRACT.address,
              abi: ESCROW_CONTRACT.abi,
              functionName: 'getJob',
              args: [jobId!]
            });

            if (job.freelancer.toLowerCase() === address.toLowerCase()) {
              newNotifications.push({
                id: eventId,
                type: 'transfer_requested',
                jobId: jobId!.toString(),
                message: `Client requested repo transfer for Job #${jobId!.toString()}`,
                timestamp: Date.now(),
                read: false
              });
            }
          }
        }

        // Process TransferConfirmed events (for clients)
        for (const log of transferConfirmedEvents) {
          const { jobId, freelancer } = log.args;
          const eventId = createEventId('transfer_confirmed', jobId!, log.blockNumber, log.logIndex!);
          
          if (!existingIds.has(eventId)) {
            const job = await publicClient.readContract({
              address: ESCROW_CONTRACT.address,
              abi: ESCROW_CONTRACT.abi,
              functionName: 'getJob',
              args: [jobId!]
            });

            if (job.client.toLowerCase() === address.toLowerCase()) {
              newNotifications.push({
                id: eventId,
                type: 'transfer_confirmed',
                jobId: jobId!.toString(),
                message: `Freelancer confirmed repo transfer for Job #${jobId!.toString()}`,
                timestamp: Date.now(),
                read: false
              });
            }
          }
        }

        // Process JobApproved events (for freelancers)
        for (const log of approvedEvents) {
          const { jobId, freelancer } = log.args;
          const eventId = createEventId('approved', jobId!, log.blockNumber, log.logIndex!);
          
          if (!existingIds.has(eventId) && freelancer?.toLowerCase() === address.toLowerCase()) {
            newNotifications.push({
              id: eventId,
              type: 'approved',
              jobId: jobId!.toString(),
              message: `Work approved! Payment released for Job #${jobId!.toString()}`,
              timestamp: Date.now(),
              read: false
            });
          }
        }

        // Process DisputeRaised events (for both parties)
        for (const log of disputeRaisedEvents) {
          const { jobId, raiser } = log.args;
          const eventId = createEventId('disputed', jobId!, log.blockNumber, log.logIndex!);
          
          if (!existingIds.has(eventId)) {
            const job = await publicClient.readContract({
              address: ESCROW_CONTRACT.address,
              abi: ESCROW_CONTRACT.abi,
              functionName: 'getJob',
              args: [jobId!]
            });

            const isClient = job.client.toLowerCase() === address.toLowerCase();
            const isFreelancer = job.freelancer.toLowerCase() === address.toLowerCase();

            if (isClient || isFreelancer) {
              newNotifications.push({
                id: eventId,
                type: 'disputed',
                jobId: jobId!.toString(),
                message: `Dispute raised for Job #${jobId!.toString()}`,
                timestamp: Date.now(),
                read: false
              });
            }
          }
        }

        // Process DisputeResolved events (for both parties)
        for (const log of disputeResolvedEvents) {
          const { jobId, recipient } = log.args;
          const eventId = createEventId('resolved', jobId!, log.blockNumber, log.logIndex!);
          
          if (!existingIds.has(eventId)) {
            const job = await publicClient.readContract({
              address: ESCROW_CONTRACT.address,
              abi: ESCROW_CONTRACT.abi,
              functionName: 'getJob',
              args: [jobId!]
            });

            const isClient = job.client.toLowerCase() === address.toLowerCase();
            const isFreelancer = job.freelancer.toLowerCase() === address.toLowerCase();

            if (isClient || isFreelancer) {
              const wonDispute = recipient?.toLowerCase() === address.toLowerCase();
              newNotifications.push({
                id: eventId,
                type: 'resolved',
                jobId: jobId!.toString(),
                message: wonDispute 
                  ? `Dispute resolved in your favor for Job #${jobId!.toString()}`
                  : `Dispute resolved for Job #${jobId!.toString()}`,
                timestamp: Date.now(),
                read: false
              });
            }
          }
        }

        // Save new notifications if any
        if (newNotifications.length > 0) {
          const updated = [...newNotifications, ...notifications];
          setNotifications(updated);
          
          const key = `archire-notifications-${address.toLowerCase()}`;
          localStorage.setItem(key, JSON.stringify(updated));
        }

      } catch (error) {
        console.error('Error polling events:', error);
      }
    };

    // Poll immediately and then every 30 seconds
    pollEvents();
    const interval = setInterval(pollEvents, 30000);

    return () => clearInterval(interval);
  }, [address, publicClient]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!address) return;

    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    };

    const updated = [newNotification, ...notifications];
    setNotifications(updated);

    const key = `archire-notifications-${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const markAsRead = (id: string) => {
    if (!address) return;

    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);

    const key = `archire-notifications-${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    if (!address) return;

    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);

    const key = `archire-notifications-${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  };
}
