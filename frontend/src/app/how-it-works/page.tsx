'use client';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">How It Works</h1>

        {/* For Clients Section */}
        <div className="glass-card rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#0052FF] mb-6">For Clients</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <p className="text-white font-semibold mb-1">Connect your wallet and post a job</p>
                <p className="text-gray-400 text-sm">Include your GitHub username if you need code or an app built</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <p className="text-white font-semibold mb-1">Review freelancer proposals and accept one</p>
                <p className="text-gray-400 text-sm">Your USDC locks in escrow automatically</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <p className="text-white font-semibold mb-1">The freelancer builds your project</p>
                <p className="text-gray-400 text-sm">They submit a live demo link and GitHub repo link</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">4</span>
              <div>
                <p className="text-white font-semibold mb-1">Review the live demo thoroughly</p>
                <p className="text-gray-400 text-sm">Test all features and functionality</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">5</span>
              <div>
                <p className="text-white font-semibold mb-1">Contact the freelancer and request the GitHub repo transfer</p>
                <p className="text-gray-400 text-sm">They will transfer ownership to your GitHub username</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">6</span>
              <div>
                <p className="text-white font-semibold mb-1">Confirm you have received and verified the repo</p>
                <p className="text-gray-400 text-sm">Check it in your GitHub account</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">7</span>
              <div>
                <p className="text-white font-semibold mb-1">Check all three boxes on the review page and click Approve</p>
                <p className="text-gray-400 text-sm">USDC releases to the freelancer automatically</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">!</span>
              <div>
                <p className="text-white font-semibold mb-1">If the work does not match what was originally agreed</p>
                <p className="text-gray-400 text-sm">Click Raise Dispute instead and the arbitrator will review the evidence and make a final decision</p>
              </div>
            </li>
          </ol>
        </div>

        {/* For Freelancers Section */}
        <div className="glass-card rounded-lg p-8">
          <h2 className="text-2xl font-bold text-[#0052FF] mb-6">For Freelancers</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <p className="text-white font-semibold mb-1">Connect your wallet and browse open jobs</p>
                <p className="text-gray-400 text-sm">Find projects that match your skills</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <p className="text-white font-semibold mb-1">Submit a proposal for a job that matches your skills</p>
                <p className="text-gray-400 text-sm">Explain why you're the best fit</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <p className="text-white font-semibold mb-1">Once the client accepts your proposal, start building</p>
                <p className="text-gray-400 text-sm">Read the job description carefully and deliver exactly what it says</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">4</span>
              <div>
                <p className="text-white font-semibold mb-1">Deploy your finished work</p>
                <p className="text-gray-400 text-sm">Submit your live demo link and GitHub repo link on ArcHire</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">5</span>
              <div>
                <p className="text-white font-semibold mb-1">Wait for the client to review your demo</p>
                <p className="text-gray-400 text-sm">Do not transfer the repo before the client requests it</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">6</span>
              <div>
                <p className="text-white font-semibold mb-1">When the client requests the transfer</p>
                <p className="text-gray-400 text-sm">Go to your GitHub repo → Settings → Danger Zone → Transfer Ownership → enter the client GitHub username shown on your submission page</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">7</span>
              <div>
                <p className="text-white font-semibold mb-1">After transferring</p>
                <p className="text-gray-400 text-sm">Go to imgur.com and upload a screenshot of the transfer confirmation — copy and save that link as your proof</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-bold">8</span>
              <div>
                <p className="text-white font-semibold mb-1">The client checks all boxes and clicks Approve</p>
                <p className="text-gray-400 text-sm">USDC releases directly to your wallet automatically</p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">!</span>
              <div>
                <p className="text-white font-semibold mb-1">If the client raises a dispute</p>
                <p className="text-gray-400 text-sm">Go to your dispute response page and paste your imgur transfer proof link along with your explanation — the arbitrator will review everything and make a final decision</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Important Notice */}
        <div className="mt-8 p-6 bg-yellow-900/20 border-2 border-yellow-500 rounded-lg">
          <h3 className="text-lg font-bold text-yellow-400 mb-3">⚠️ Important</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• The original job description is the source of truth for all disputes on ArcHire</li>
            <li>• Clients: do not approve until you have received and verified the GitHub repo transfer</li>
            <li>• Freelancers: upload your transfer confirmation screenshot to imgur.com and save the link as proof before the job is marked complete</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
