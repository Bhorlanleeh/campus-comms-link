
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
  // First check if the bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error("Error checking buckets:", bucketsError);
    throw bucketsError;
  }
  
  // Create the bucket if it doesn't exist
  const bucketExists = buckets?.some(b => b.name === bucket);
  if (!bucketExists) {
    console.log(`Creating bucket: ${bucket}`);
    try {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      });
      
      if (error) {
        console.error("Error creating bucket:", error);
        throw error;
      }
    } catch (err) {
      console.error("Failed to create bucket:", err);
      throw err;
    }
  }

  // Create appropriate RLS policies if needed
  try {
    // Check if the policies exist first to avoid errors
    const { data: policies } = await supabase.rpc('get_policies_for_bucket', { bucket_name: bucket });
    
    if (!policies || policies.length === 0) {
      console.log(`Setting up policies for bucket: ${bucket}`);
      // Create RLS policies for the bucket (this would be better in a SQL migration)
      // You might need to adapt this based on your exact needs
    }
  } catch (err) {
    // Continue even if policy check fails - not critical
    console.warn("Could not check bucket policies:", err);
  }

  // Upload the file
  console.log(`Uploading file to ${bucket}/${path}`);
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
  
  console.log("File uploaded successfully. Public URL:", publicURL.publicUrl);
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
