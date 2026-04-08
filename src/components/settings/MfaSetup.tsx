import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, ShieldAlert, Loader2, Smartphone } from 'lucide-react';

export function MfaSetup() {
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactor = data.totp.find((factor) => factor.status === 'verified');
      if (totpFactor) {
        setIsEnabled(true);
        setFactorId(totpFactor.id);
      } else {
        setIsEnabled(false);
      }
    } catch (err: any) {
      console.error('Erro ao buscar fatores MFA:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEnrollment = async () => {
    try {
      setError(null);
      setIsEnrolling(true);
      
      // Limpa qualquer tentativa anterior não finalizada para evitar o erro "factor already exists"
      const { data: listData } = await supabase.auth.mfa.listFactors();
      if (listData && listData.totp) {
        const unverifiedFactors = listData.totp.filter(f => f.status === 'unverified');
        for (const factor of unverifiedFactors) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'App Autenticador',
      });

      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar configuração do MFA.');
      setIsEnrolling(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!factorId || verifyCode.length < 6) {
      setError('Por favor, insira o código de 6 dígitos.');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      setIsEnabled(true);
      setIsEnrolling(false);
      setSuccess('Autenticação Multifator ativada com sucesso!');
      setVerifyCode('');
    } catch (err: any) {
      setError(err.message || 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async () => {
    if (!factorId) return;
    
    if (!window.confirm('Tem certeza que deseja desativar o MFA? Isso reduzirá a segurança da sua conta.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      setIsEnabled(false);
      setFactorId(null);
      setSuccess('Autenticação Multifator desativada.');
    } catch (err: any) {
      setError(err.message || 'Erro ao desativar MFA.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEnrolling && !isEnabled) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Autenticação Multifator (MFA)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adicione uma camada extra de segurança à sua conta exigindo um código de verificação no login.
          </p>
        </div>
        {isEnabled ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <ShieldCheck className="w-4 h-4" />
            Ativado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <ShieldAlert className="w-4 h-4" />
            Desativado
          </span>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-sm">{success}</div>}

      {!isEnabled && !isEnrolling && (
        <button onClick={startEnrollment} className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
          Configurar MFA
        </button>
      )}

      {isEnabled && (
        <button onClick={disableMfa} disabled={loading} className="mt-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-md font-medium transition-colors disabled:opacity-50">
          {loading ? 'Processando...' : 'Desativar MFA'}
        </button>
      )}

      {isEnrolling && qrCode && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Siga os passos abaixo:</h4>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">1. Baixe um aplicativo autenticador (Google/Microsoft Authenticator).</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">2. Escaneie o QR Code ao lado.</p>
              <div className="pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">3. Digite o código de 6 dígitos gerado:</p>
                <div className="flex gap-2">
                  <input type="text" maxLength={6} value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm" />
                  <button onClick={verifyAndEnable} disabled={loading || verifyCode.length < 6} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />} Verificar
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-inner">
              <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
            </div>
          </div>
          <button onClick={() => { setIsEnrolling(false); setQrCode(null); }} className="mt-6 text-sm text-gray-500 hover:text-gray-700">Cancelar configuração</button>
        </div>
      )}
    </div>
  );
}