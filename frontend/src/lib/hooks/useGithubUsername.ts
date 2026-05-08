import { useReadContract } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';

export function useGithubUsername(jobId: bigint) {
  const { data: githubUsername, isLoading, error, refetch } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'getGithubUsername',
    args: [jobId],
  });

  return {
    githubUsername: githubUsername as string | undefined,
    isLoading,
    error,
    refetch,
  };
}
