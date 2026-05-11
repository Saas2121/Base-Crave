import { supabase } from '../config/supabase';
import fs from 'fs';

export async function uploadToSupabaseStorage(
  filePath: string,
  fileName: string,
  contentType: string,
  bucket: string = 'imagenes'
): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const supabaseFileName = `${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(supabaseFileName, fileBuffer, { contentType, upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(supabaseFileName);

    return publicUrl;
  } catch (err) {
    console.error('Supabase Storage upload failed:', err);
    return null;
  }
}
