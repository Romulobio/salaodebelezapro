import { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PixConfig = () => {
    const { slug } = useParams<{ slug: string }>();
    const [loading, setLoading] = useState(false);
    const [barbeariaId, setBarbeariaId] = useState<string | null>(null);

    // Estado do PIX
    const [pixKey, setPixKey] = useState('');
    const [pixQrCode, setPixQrCode] = useState('');

    useEffect(() => {
        const fetchBarbearia = async () => {
            if (!slug) return;
            const { data } = await supabase
                .from('barbearias')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();
            if (data) {
                setBarbeariaId(data.id);
            }
        };
        fetchBarbearia();
    }, [slug]);

    useEffect(() => {
        if (barbeariaId) {
            loadPixConfig();
        }
    }, [barbeariaId]);

    const loadPixConfig = async () => {
        // @ts-ignore
        const { data } = await supabase
            .from('agenda_config')
            .select('*')
            .eq('barbearia_id', barbeariaId)
            .maybeSingle();

        if (data) {
            setPixKey(data.pix_chave || '');
            setPixQrCode(data.pix_qrcode_base64 || '');
        }
    };

    const handleSave = async () => {
        if (!barbeariaId) return;
        setLoading(true);

        const payload = {
            barbearia_id: barbeariaId,
            pix_chave: pixKey,
            pix_qrcode_base64: pixQrCode
        };

        // Update seguro (preservando horários)
        const { data: existing } = await supabase.from('agenda_config').select('id').eq('barbearia_id', barbeariaId).maybeSingle();

        let error;
        if (existing) {
            // @ts-ignore
            ({ error } = await supabase.from('agenda_config').update(payload).eq('barbearia_id', barbeariaId));
        } else {
            // @ts-ignore
            ({ error } = await supabase.from('agenda_config').insert(payload));
        }

        setLoading(false);
        if (error) {
            toast.error('Erro ao salvar configuração PIX');
            console.error(error);
        } else {
            toast.success('PIX atualizado com sucesso!');
        }
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPixQrCode(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <DashboardLayout type="admin" barbeariaSlug={slug}>
            <div className="p-8 max-w-4xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3 mb-2">
                        <QrCode className="w-8 h-8 text-primary" />
                        Configuração PIX
                    </h1>
                    <p className="text-muted-foreground">
                        Defina como você recebe pagamentos via PIX
                    </p>
                </motion.div>

                <Card className="neon-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-neon-green to-neon-cyan rotate-45 transform scale-75 rounded-sm" />
                            PIX Copia e Cola & QR Code
                        </CardTitle>
                        <CardDescription>
                            Facilite o pagamento para seus clientes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Código PIX (Copia e Cola)</label>
                                <textarea
                                    placeholder="Cole aqui o código do QR Code do seu PIX..."
                                    value={pixKey}
                                    onChange={(e) => setPixKey(e.target.value)}
                                    className="w-full min-h-[100px] rounded-lg border-2 border-primary/30 bg-input/50 px-4 py-3 text-neon-cyan placeholder:text-muted-foreground focus:outline-none focus:border-neon-cyan transition-all font-mono text-xs"
                                />
                                <p className="text-xs text-muted-foreground">
                                    * Este código será exibido para seus clientes na tela de pagamento.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Imagem QR Code (Opcional)</label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="bg-input/50 border-primary/30 text-foreground file:text-primary file:font-medium"
                                    />
                                    {pixQrCode && (
                                        <div className="w-12 h-12 bg-white p-1 rounded">
                                            <img src={pixQrCode} alt="Preview" className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Faça upload do QR Code para que o cliente possa escanear.
                                </p>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Salvar PIX
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default PixConfig;
