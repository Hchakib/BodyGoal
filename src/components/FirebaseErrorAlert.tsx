import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

interface FirebaseErrorAlertProps {
  error: string;
  onDismiss?: () => void;
}

export function FirebaseErrorAlert({ error, onDismiss }: FirebaseErrorAlertProps) {
  // Détection du type d'erreur
  const isUnauthorizedDomain = error.includes('unauthorized-domain') || error.includes('domaine');
  const isPermissionDenied = error.includes('permission-denied') || error.includes('permissions');
  
  const getErrorDetails = () => {
    if (isUnauthorizedDomain) {
      return {
        title: 'Domaine non autorisé',
        message: 'Ce domaine n\'est pas configuré dans Firebase Authentication.',
        action: 'Configurer Firebase',
        link: 'https://console.firebase.google.com/project/bodygoal-4213e/authentication/settings',
        instructions: [
          'Allez dans Firebase Console → Authentication → Settings',
          'Ajoutez ce domaine dans "Authorized domains"',
          'Attendez quelques minutes et réessayez',
        ],
      };
    }
    
    if (isPermissionDenied) {
      return {
        title: 'Accès refusé',
        message: 'Les règles de sécurité Firestore doivent être configurées.',
        action: 'Configurer Firestore',
        link: 'https://console.firebase.google.com/project/bodygoal-4213e/firestore/rules',
        instructions: [
          'Allez dans Firebase Console → Firestore → Rules',
          'Copiez les règles depuis FIREBASE_SETUP_INSTRUCTIONS.md',
          'Publiez les nouvelles règles',
        ],
      };
    }
    
    return {
      title: 'Erreur Firebase',
      message: error,
      action: null,
      link: null,
      instructions: [],
    };
  };
  
  const details = getErrorDetails();
  
  return (
    <Alert className="bg-red-950/20 border-red-500/30 text-white mb-4">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <AlertTitle className="text-red-400">{details.title}</AlertTitle>
      <AlertDescription className="text-gray-300 mt-2">
        <p className="mb-3">{details.message}</p>
        
        {details.instructions.length > 0 && (
          <div className="bg-[#0B0B0F] rounded-lg p-4 mb-3">
            <p className="text-sm font-medium mb-2 text-white">Étapes de résolution :</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              {details.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-400">{instruction}</li>
              ))}
            </ol>
          </div>
        )}
        
        {details.link && (
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => window.open(details.link!, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {details.action}
          </Button>
        )}
        
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-2 text-gray-400 hover:text-white"
            onClick={onDismiss}
          >
            Fermer
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
