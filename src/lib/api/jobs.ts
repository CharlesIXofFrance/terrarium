import { supabase } from '../supabase';
import type { Job, JobApplication } from '../../types/domain/jobs';

export async function getJobs(communityId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('community_id', communityId)
    .eq('status', 'active');

  if (error) throw error;
  return data;
}

export async function getJob(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createJob(
  job: Omit<Job, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase.from('jobs').insert(job).single();

  if (error) throw error;
  return data;
}

export async function updateJob(id: string, updates: Partial<Job>) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteJob(id: string) {
  const { error } = await supabase.from('jobs').delete().eq('id', id);

  if (error) throw error;
}

export async function applyToJob(
  application: Omit<JobApplication, 'id' | 'submitted_at'>
) {
  const { data, error } = await supabase
    .from('job_applications')
    .insert(application)
    .single();

  if (error) throw error;
  return data;
}

export async function getJobApplications(
  jobId: string
): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', jobId);

  if (error) throw error;
  return data;
}
