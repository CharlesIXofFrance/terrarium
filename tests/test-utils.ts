import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

interface TestContext {
  supabaseUrl: string;
  supabaseKey: string;
  serviceRoleKey: string;
}

const getTestContext = (): TestContext => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
    throw new Error('Missing required environment variables for tests');
  }

  return {
    supabaseUrl,
    supabaseKey,
    serviceRoleKey,
  };
};

export const createTestClient = () => {
  const { supabaseUrl, supabaseKey } = getTestContext();
  return createClient(supabaseUrl, supabaseKey);
};

export const createAdminClient = () => {
  const { supabaseUrl, serviceRoleKey } = getTestContext();
  return createClient(supabaseUrl, serviceRoleKey);
};

export const generateTestEmail = (prefix: string = 'test') =>
  `${prefix}.${uuidv4()}@terrarium-test.com`;

export const generateTestPassword = () =>
  `Test${uuidv4().replace(/-/g, '').substring(0, 12)}!`;

interface TestFile {
  content: File;
  size: number;
  type: string;
  name: string;
}

export const createTestFile = (
  options: {
    sizeInKB?: number;
    type?: string;
    name?: string;
  } = {}
): TestFile => {
  const sizeInKB = options.sizeInKB || 100;
  const type = options.type || 'image/png';
  const name = options.name || 'test.png';

  // Create a minimal valid PNG file
  const pngSignature = new Uint8Array([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a, // PNG signature
    0x00,
    0x00,
    0x00,
    0x0d, // IHDR chunk length
    0x49,
    0x48,
    0x44,
    0x52, // "IHDR"
    0x00,
    0x00,
    0x00,
    0x01, // width: 1
    0x00,
    0x00,
    0x00,
    0x01, // height: 1
    0x08, // bit depth: 8
    0x06, // color type: RGBA
    0x00, // compression: deflate
    0x00, // filter: standard
    0x00, // interlace: none
    0x1f,
    0x15,
    0xc4,
    0x89, // IHDR CRC
    0x00,
    0x00,
    0x00,
    0x0c, // IDAT chunk length
    0x49,
    0x44,
    0x41,
    0x54, // "IDAT"
    0x08,
    0xd7,
    0x63,
    0x60, // deflate data
    0x60,
    0x60,
    0x00,
    0x00,
    0x00,
    0x02,
    0x00,
    0x01, // deflate CRC
    0x00,
    0x00,
    0x00,
    0x00, // IEND chunk length
    0x49,
    0x45,
    0x4e,
    0x44, // "IEND"
    0xae,
    0x42,
    0x60,
    0x82, // IEND CRC
  ]);

  // Create a File object instead of a Blob to better preserve MIME type
  const content = new File(
    [type === 'image/png' ? pngSignature : new Uint8Array(sizeInKB * 1024)],
    name,
    { type }
  );

  return {
    content,
    size: content.size,
    type,
    name,
  };
};

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class TestError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'TestError';
  }
}
