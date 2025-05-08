
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @param file The file to upload
 * @returns The public URL of the uploaded file
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string> => {
  // Try to create the bucket if it doesn't exist
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.log(`Bucket '${bucket}' doesn't exist, attempting to create it`);
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true
      });
      
      if (error) {
        console.error("Error creating bucket:", error);
      }
    }
  } catch (error) {
    console.error("Error checking/creating bucket:", error);
  }

  // Upload the file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  
  if (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
  
  // Get the public URL
  const { data: publicURL } = supabase.storage
    .from(bucket)
    .getPublicUrl(data?.path || path);
  
  return publicURL.publicUrl;
};

/**
 * Get a public URL for a file in Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns The public URL of the file
 */
export const getFileUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Delete a file from Supabase Storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @returns A boolean indicating whether the deletion was successful
 */
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
};
