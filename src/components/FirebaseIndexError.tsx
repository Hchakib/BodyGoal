import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

interface FirebaseIndexErrorProps {
  error?: any;
}

export function FirebaseIndexError({ error }: FirebaseIndexErrorProps) {
  // Check if error is a Firestore index error
  const isIndexError = error?.code === 'failed-precondition' && error?.message?.includes('index');
  
  if (!isIndexError) return null;

  // Extract the index creation link from the error message
  const linkMatch = error.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
  const indexLink = linkMatch ? linkMatch[0] : null;

  return (
    <Alert className="bg-[#151923] border-[#22C55E]/30 mb-6">
      <AlertCircle className="h-5 w-5 text-[#22C55E]" />
      <AlertTitle className="text-white mb-2">
        🔥 Firestore Index Required
      </AlertTitle>
      <AlertDescription className="text-gray-300">
        <p className="mb-3">
          This feature needs a Firestore index to work. Don't worry, this is a one-time setup!
        </p>
        
        {indexLink ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              <strong>Quick Fix (2 minutes):</strong>
            </p>
            <ol className="text-sm text-gray-400 space-y-1 ml-4 list-decimal">
              <li>Click the button below</li>
              <li>Click "Create Index" in Firebase Console</li>
              <li>Wait 2-5 minutes for the index to build</li>
              <li>Refresh this page</li>
            </ol>
            
            <Button
              className="mt-3 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90"
              onClick={() => window.open(indexLink, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Create Index in Firebase
            </Button>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-gray-400">
              Check the browser console for a link to create the required index.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-[#0B0B0F] rounded-lg border border-white/5">
          <p className="text-xs text-gray-500">
            💡 <strong>Tip:</strong> You'll need to create about 6 indexes total. Each time you see this message, 
            just click the link. This is normal for Firestore apps and only needs to be done once per index.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
