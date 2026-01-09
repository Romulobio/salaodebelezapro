import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for passwords (using Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, slug, password, barbearia_id, new_password, ...rest } = body;

    console.log(`Barbearia auth action: ${action}, slug: ${slug}`);

    if (action === 'hash') {
      // Hash a new password (used when creating/updating barbearia)
      const hash = await hashPassword(password);
      return new Response(
        JSON.stringify({ hash }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create-barbearia') {
      const { nome, proprietario_nome, email, telefone, endereco, descricao, plano_tipo, plano_valor } = rest;

      const hash = await hashPassword(password);

      const { data, error } = await supabase
        .from('barbearias')
        .insert({
          nome,
          proprietario_nome,
          email,
          telefone,
          endereco,
          descricao,
          slug,
          plano_tipo,
          plano_valor,
          senha_hash: hash
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating barbearia:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao criar barbearia: ' + error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, barbearia: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'login') {
      // Verify password for barbearia login
      const { data: barbearia, error } = await supabase
        .from('barbearias')
        .select('id, nome, slug, senha_hash, ativo')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching barbearia:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao buscar barbearia' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!barbearia) {
        return new Response(
          JSON.stringify({ success: false, error: 'Barbearia não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (barbearia.ativo === false) {
        return new Response(
          JSON.stringify({ success: false, error: 'Barbearia bloqueada pelo administrador.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!barbearia.senha_hash) {
        return new Response(
          JSON.stringify({ success: false, error: 'Barbearia sem senha configurada' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isValid = await verifyPassword(password, barbearia.senha_hash);

      if (!isValid) {
        return new Response(
          JSON.stringify({ success: false, error: 'Senha incorreta' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a simple session token
      const sessionToken = crypto.randomUUID();

      return new Response(
        JSON.stringify({
          success: true,
          barbearia: {
            id: barbearia.id,
            nome: barbearia.nome,
            slug: barbearia.slug,
            ativo: barbearia.ativo
          },
          session_token: sessionToken
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update_password') {
      // Update barbearia password
      const hash = await hashPassword(new_password);

      const { error } = await supabase
        .from('barbearias')
        .update({ senha_hash: hash })
        .eq('id', barbearia_id);

      if (error) {
        console.error('Error updating password:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao atualizar senha' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update_barbearia') {
      const { data, error } = await supabase
        .from('barbearias')
        .update(rest)
        .eq('id', barbearia_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating barbearia (Admin):', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao atualizar barbearia: ' + error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete_barbearia') {
      const { error } = await supabase
        .from('barbearias')
        .delete()
        .eq('id', barbearia_id);

      if (error) {
        console.error('Error deleting barbearia (Admin):', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao excluir barbearia: ' + error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ação inválida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in barbearia-auth:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
