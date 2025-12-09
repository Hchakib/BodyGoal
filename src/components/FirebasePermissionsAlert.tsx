import { AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export function FirebasePermissionsAlert() {
  const [copied, setCopied] = useState(false);

  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create, update: if isOwner(userId);
      allow delete: if false;
      
      match /workouts/{workoutId} {
        allow read, create, update, delete: if isOwner(userId);
      }
      
      match /personalRecords/{recordId} {
        allow read, create, update, delete: if isOwner(userId);
      }
      
      match /workoutTemplates/{templateId} {
        allow read, create, update, delete: if isOwner(userId);
      }
      
      match /scheduledWorkouts/{scheduledId} {
        allow read, create, update, delete: if isOwner(userId);
      }
      
      match /nutrition/{nutritionId} {
        allow read, create, update, delete: if isOwner(userId);
      }
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] border border-red-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-red-500/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl text-white mb-2">
                🔒 Firebase Permissions Required
              </h2>
              <p className="text-gray-300">
                Your Firestore database needs updated security rules to use the new scheduling features.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                <span className="text-[#22C55E]">1</span>
              </div>
              <h3 className="text-white text-lg">Open Firebase Console</h3>
            </div>
            <div className="ml-10">
              <p className="text-gray-400 mb-3">
                Go to your Firebase project and navigate to Firestore Rules:
              </p>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B0B0F] border border-white/10 rounded-lg text-[#00D1FF] hover:border-[#00D1FF]/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Firebase Console
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Then: Your Project → Firestore Database → Rules tab
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                <span className="text-[#22C55E]">2</span>
              </div>
              <h3 className="text-white text-lg">Copy & Paste Rules</h3>
            </div>
            <div className="ml-10">
              <p className="text-gray-400 mb-3">
                Copy these security rules and paste them into the Firebase Rules editor:
              </p>
              <div className="relative">
                <pre className="bg-[#0B0B0F] border border-white/10 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-[300px]">
                  {rules}
                </pre>
                <Button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 bg-[#22C55E]/20 hover:bg-[#22C55E]/30 border border-[#22C55E]/30"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Rules
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                <span className="text-[#22C55E]">3</span>
              </div>
              <h3 className="text-white text-lg">Publish Changes</h3>
            </div>
            <div className="ml-10">
              <p className="text-gray-400 mb-3">
                Click the <span className="text-[#22C55E] font-medium">"Publish"</span> button in Firebase to apply the new rules.
              </p>
              <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-lg p-3">
                <p className="text-sm text-[#22C55E]">
                  ✅ After publishing, refresh this page and the error will be gone!
                </p>
              </div>
            </div>
          </div>

          {/* What these rules do */}
          <div className="bg-[#0B0B0F] rounded-xl p-4 border border-white/5">
            <h4 className="text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#00D1FF]" />
              What do these rules do?
            </h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• ✅ Allow authenticated users to access their own data</li>
              <li>• ✅ Protect users' data from being accessed by others</li>
              <li>• ✅ Enable the new scheduling features</li>
              <li>• ✅ Keep your workout data secure and private</li>
            </ul>
          </div>

          {/* Refresh button */}
          <div className="pt-4 border-t border-white/5">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
              size="lg"
            >
              I've Updated the Rules - Refresh Page
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Click this button after you've published the rules in Firebase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
