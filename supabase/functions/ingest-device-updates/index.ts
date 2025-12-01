import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeviceUpdatePayload {
  hostname: string;
  serial_number?: string;
  os_version: string;
  os_build?: string;
  last_boot_time?: string;
  ip_address?: string;
  pending_updates: Array<{
    kb_number: string;
    title: string;
    severity?: string;
    size_mb?: number;
  }>;
  installed_updates: Array<{
    kb_number: string;
    title: string;
    installed_date: string;
  }>;
  failed_updates?: Array<{
    kb_number: string;
    title: string;
    error_code?: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const authHeader = req.headers.get('Authorization');
    const apiKey = Deno.env.get('DEVICE_AGENT_API_KEY');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const providedKey = authHeader.replace('Bearer ', '');
    if (providedKey !== apiKey) {
      console.error('Invalid API key provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const payload: DeviceUpdatePayload = await req.json();

    // Validate required fields
    if (!payload.hostname || !payload.os_version) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: hostname and os_version' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing update data for device: ${payload.hostname}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate compliance status
    const hasCriticalPending = payload.pending_updates.some(
      u => u.severity?.toLowerCase() === 'critical'
    );
    const hasFailedUpdates = (payload.failed_updates?.length || 0) > 0;
    const complianceStatus = hasCriticalPending || hasFailedUpdates ? 'non-compliant' : 'compliant';

    // Upsert device record
    const { data: device, error: deviceError } = await supabase
      .from('system_devices')
      .upsert({
        hostname: payload.hostname,
        serial_number: payload.serial_number,
        os_version: payload.os_version,
        os_build: payload.os_build,
        last_check_in: new Date().toISOString(),
        last_boot_time: payload.last_boot_time,
        ip_address: payload.ip_address,
        pending_updates_count: payload.pending_updates.length,
        failed_updates_count: payload.failed_updates?.length || 0,
        compliance_status: complianceStatus,
        is_online: true,
      }, {
        onConflict: 'hostname',
      })
      .select()
      .single();

    if (deviceError) {
      console.error('Error upserting device:', deviceError);
      return new Response(
        JSON.stringify({ error: 'Failed to update device record', details: deviceError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Device record updated for: ${device.hostname} (ID: ${device.id})`);

    // Log update history entries
    const historyEntries = [];

    // Log pending updates
    for (const update of payload.pending_updates) {
      historyEntries.push({
        device_id: device.id,
        kb_number: update.kb_number,
        update_title: update.title,
        severity: update.severity || 'unknown',
        status: 'pending',
        size_mb: update.size_mb,
      });
    }

    // Log installed updates
    for (const update of payload.installed_updates) {
      historyEntries.push({
        device_id: device.id,
        kb_number: update.kb_number,
        update_title: update.title,
        status: 'installed',
        installed_date: update.installed_date,
      });
    }

    // Log failed updates
    if (payload.failed_updates) {
      for (const update of payload.failed_updates) {
        historyEntries.push({
          device_id: device.id,
          kb_number: update.kb_number,
          update_title: update.title,
          status: 'failed',
          error_message: update.error_code,
        });
      }
    }

    if (historyEntries.length > 0) {
      const { error: historyError } = await supabase
        .from('system_updates')
        .upsert(historyEntries, {
          onConflict: 'device_id,kb_number',
        });

      if (historyError) {
        console.error('Error logging update history:', historyError);
        // Don't fail the entire request if history logging fails
      } else {
        console.log(`Logged ${historyEntries.length} update history entries`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        device_id: device.id,
        hostname: device.hostname,
        compliance_status: complianceStatus,
        updates_processed: historyEntries.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ingest-device-updates function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
