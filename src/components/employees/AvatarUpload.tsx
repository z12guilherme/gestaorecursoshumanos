import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Assumindo que o cliente supabase está aqui
import imageCompression from 'browser-image-compression';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, User, Camera } from 'lucide-react';

interface AvatarUploadProps {
  uid: string; // ID do usuário para nomear o arquivo
  url: string | null | undefined;
  onUpload: (filePath: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ uid, url, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza a visualização se a URL mudar externamente (ex: ao carregar o funcionário)
  useEffect(() => {
    setAvatarUrl(url || null);
  }, [url]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer o upload.');
      }

      const file = event.target.files[0];

      // 1. Preview Imediato (Mostra a imagem localmente antes mesmo de subir)
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);

      // --- Instruções de Compressão ---
      // Max 1MB, e redimensiona para no máximo 500px de largura/altura
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };

      console.log('Comprimindo imagem...');
      const compressedFile = await imageCompression(file, options);
      console.log(`Imagem comprimida de ${(file.size / 1024 / 1024).toFixed(2)}MB para ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

      // Usa a extensão do arquivo original ou assume jpg
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      // Usamos apenas o ID para substituir o arquivo existente e economizar espaço
      const fileName = `${uid}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile, {
          upsert: true,
          cacheControl: '0', // Instrui o navegador/CDN a não fazer cache do arquivo
          contentType: compressedFile.type // Garante que o navegador saiba que é uma imagem
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtém a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 2. Adiciona timestamp para evitar cache do navegador (Cache Busting)
      const publicUrlWithTimestamp = `${publicUrl}?t=${new Date().getTime()}`;

      // setAvatarUrl(publicUrlWithTimestamp); // Não precisamos atualizar o local state pois o objectUrl já está lá e é mais rápido
      onUpload(publicUrlWithTimestamp); // Retorna a nova URL para o formulário pai salvar no banco

    } catch (error) {
      if (error instanceof Error) {
        alert('Erro ao fazer upload da imagem: ' + error.message);
        setAvatarUrl(url || null); // Reverte para a imagem anterior em caso de erro
      }
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={avatarUrl || ''} alt="Avatar do funcionário" className="object-cover" />
          <AvatarFallback className="text-3xl">
            <User className="h-16 w-16" />
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute bottom-1 right-1 rounded-full"
          onClick={triggerFileInput}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        id="single"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      <p className="text-xs text-muted-foreground">
        Recomendado: 500x500 pixels, máx 1MB.
      </p>
    </div>
  );
};