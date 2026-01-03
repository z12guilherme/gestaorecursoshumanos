import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export function ReloadPrompt() {
  const { toast } = useToast();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (needRefresh) {
      toast({
        title: "Nova versão disponível",
        description: "O aplicativo foi atualizado. Clique para carregar a nova versão.",
        action: (
          <ToastAction altText="Atualizar" onClick={() => updateServiceWorker(true)}>
            Atualizar
          </ToastAction>
        ),
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker, toast]);

  return null;
}