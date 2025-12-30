import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Endpoint de teste para enviar uma mensagem de teste via WhatsApp
 * 
 * Para testar, faça uma requisição POST para:
 * http://localhost:3000/api/test/send-whatsapp
 * 
 * Body (JSON):
 * {
 *   "phone": "5512981082276",
 *   "message": "Teste de mensagem do sistema Kanban"
 * }
 */

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, message } = body;

        if (!phone || !message) {
            return NextResponse.json(
                { error: 'Phone e message são obrigatórios' },
                { status: 400 }
            );
        }

        const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://104.248.184.126:8080';
        const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME || 'intelisensor';
        const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'B0F1888ADAE4-4C72-B849-B12709F80913';

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (EVOLUTION_API_KEY) {
            headers['apikey'] = EVOLUTION_API_KEY;
        }

        console.log('Enviando mensagem para:', phone);
        console.log('URL:', `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`);

        const response = await fetch(
            `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    number: phone,
                    text: message,
                }),
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Erro da Evolution API:', responseData);
            return NextResponse.json(
                {
                    error: 'Erro ao enviar mensagem',
                    details: responseData,
                    status: response.status
                },
                { status: response.status }
            );
        }

        console.log('Mensagem enviada com sucesso:', responseData);

        return NextResponse.json({
            success: true,
            message: 'Mensagem enviada com sucesso!',
            data: responseData,
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Erro ao enviar mensagem de teste:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: errorMessage },
            { status: 500 }
        );
    }
}

/**
 * Endpoint GET para testar a conexão com a Evolution API
 */
export async function GET() {
    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://104.248.184.126:8080';
    const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME || 'intelisensor';

    return NextResponse.json({
        message: 'Endpoint de teste WhatsApp',
        config: {
            url: EVOLUTION_API_URL,
            instance: EVOLUTION_INSTANCE,
            hasApiKey: !!process.env.EVOLUTION_API_KEY,
        },
        usage: {
            method: 'POST',
            endpoint: '/api/test/send-whatsapp',
            body: {
                phone: '5512981082276',
                message: 'Sua mensagem aqui',
            },
        },
    });
}
