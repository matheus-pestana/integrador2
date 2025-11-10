'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import type {
    MarketSegmentationInsightsOutput,
    MarketingStrategiesInput,
    DataTreatmentInput,
    AnalysisMetadata,
    User // Importar o novo tipo
} from '@/types/ai-types';

// URLs dos microsserviços
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8000/api/auth';
const SEGMENTATION_API_URL = process.env.NEXT_PUBLIC_SEGMENTATION_API_URL || 'http://localhost:8001/api';
const STRATEGY_API_URL = process.env.NEXT_PUBLIC_STRATEGY_API_URL || 'http://localhost:8002/api';


// --- Zod Schemas ---

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const registerSchema = z.object({
    name: z.string().min(2, { message: 'O nome é obrigatório.' }),
    email: z.string().email({ message: 'Email inválido.' }),
    password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

const profileSchema = z.object({
    name: z.string().min(2, { message: 'O nome é obrigatório.' }),
    avatar_url: z.string().url({ message: 'URL do avatar inválida.' }).or(z.literal('')),
});

const strategiesSchema = z.object({
    // ... (código existente, sem alterações)
    customerSegmentAttributes: z.string().min(10, { message: 'Por favor, forneça mais detalhes sobre o segmento de clientes.' }),
    campaignObjectives: z.string().min(10, { message: 'Por favor, forneça mais detalhes sobre os objetivos da campanha.' }),
});

// --- Tipos de Estado ---

export type LoginState = { error?: string };
export type RegisterState = { error?: string };
export type ProfileState = { error?: string; success?: boolean; user?: User };

export type StrategiesState = {
    // ... (código existente, sem alterações)
    message?: string;
    strategies?: string[];
    errors?: {
        customerSegmentAttributes?: string[];
        campaignObjectives?: string[];
    }
}

export type SegmentationState = {
    // ... (código existente, sem alterações)
    message: 'success' | 'error' | 'loading';
    analysis?: MarketSegmentationInsightsOutput;
    errorMessage?: string;
    analysisId?: number;
}

export type HistoryListState = {
    // ... (código existente, sem alterações)
    message: 'success' | 'error';
    analyses?: AnalysisMetadata[];
    errorMessage?: string;
}


// --- FUNÇÃO HELPER PARA PEGAR O TOKEN ---
async function getAuthHeaders() {
    const cookieStore = await cookies(); // Aguarde aqui
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
        throw new Error('Não autorizado');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}


// --- NOVAS ACTIONS DE AUTENTICAÇÃO ---

export async function login(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: 'Dados inválidos.' };
    }

    const { email, password } = validatedFields.data;

    try {
        // O FastAPI OAuth2 espera dados de formulário, não JSON
        const body = new URLSearchParams();
        body.append('username', email);
        body.append('password', password);

        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Email ou senha incorretos.' }));
            return { error: errorData.detail };
        }

        const tokenData = await response.json();

        cookies().set('session_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 dias
            path: '/',
        });

    } catch (error) {
        return { error: 'Falha na comunicação com o servidor de autenticação.' };
    }

    redirect('/dashboard');
}

export async function register(prevState: RegisterState | undefined, formData: FormData): Promise<RegisterState> {
    const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0];
        return { error: firstError ? firstError[0] : 'Dados inválidos.' };
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validatedFields.data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro ao criar conta.' }));
            return { error: errorData.detail };
        }

        const tokenData = await response.json();

        cookies().set('session_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 dias
            path: '/',
        });

    } catch (error) {
        return { error: 'Falha na comunicação com o servidor de autenticação.' };
    }

    redirect('/dashboard');
}

export async function logout() {
    (await cookies()).delete('session_token'); // Aguarde aqui
    redirect('/login');
}

export async function getMe(): Promise<User | null> {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${AUTH_API_URL}/me`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) return null;
        return await response.json();

    } catch (error) {
        return null;
    }
}

export async function updateProfile(prevState: ProfileState | undefined, formData: FormData): Promise<ProfileState> {
    const validatedFields = profileSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0];
        return { error: firstError ? firstError[0] : 'Dados inválidos.' };
    }

    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${AUTH_API_URL}/profile`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(validatedFields.data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro ao atualizar perfil.' }));
            return { error: errorData.detail };
        }

        const updatedUser: User = await response.json();
        revalidatePath('/profile'); // Limpa o cache da Server Action
        return { success: true, user: updatedUser };

    } catch (error) {
        return { error: 'Falha na comunicação com o servidor.' };
    }
}


// --- ACTIONS EXISTENTES ATUALIZADAS ---

export async function getMarketingStrategies(prevState: StrategiesState, formData: FormData): Promise<StrategiesState> {
    const validatedFields = strategiesSchema.safeParse({
        // ... (código existente, sem alterações)
        customerSegmentAttributes: formData.get('customerSegmentAttributes'),
        campaignObjectives: formData.get('campaignObjectives'),
    });

    if (!validatedFields.success) {
        // ... (código existente, sem alterações)
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Dados do formulário inválidos.',
        };
    }

    try {
        const headers = await getAuthHeaders(); // PROTEGER
        const inputData: MarketingStrategiesInput = validatedFields.data;

        const response = await fetch(`${STRATEGY_API_URL}/marketing-strategies`, {
            method: 'POST',
            headers: headers, // USAR HEADERS
            body: JSON.stringify(inputData),
        });

        if (!response.ok) {
            // ... (código existente, sem alterações)
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API Python.' }));
            console.error("Erro da API Python (Estratégias):", errorData);
            return { message: `Erro da API: ${errorData.detail || response.statusText}` };
        }

        const result = await response.json();

        if (!result || !Array.isArray(result.marketingStrategies)) {
            // ... (código existente, sem alterações)
            return { message: 'Resposta inválida da API Python.' };
        }

        return { message: 'success', strategies: result.marketingStrategies };

    } catch (error) {
        // ... (código existente, sem alterações)
        console.error("Erro ao chamar getMarketingStrategies:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { message: `Falha na comunicação com a API: ${errorMessage}` };
    }
}

interface MarketSegmentationInsightsInputApi {
    // ... (código existente, sem alterações)
    clusterData: string;
    dataTreatment: DataTreatmentInput;
    numberOfClusters: number;
}

export async function getSegmentationInsights(
    clusterData: string,
    dataTreatment: DataTreatmentInput,
    numberOfClusters: number
): Promise<SegmentationState> {
    if (!clusterData) {
        // ... (código existente, sem alterações)
        return { message: 'error', errorMessage: 'Dados CSV não fornecidos.' };
    }

    try {
        const headers = await getAuthHeaders(); // PROTEGER
        const inputData: MarketSegmentationInsightsInputApi = { clusterData, dataTreatment, numberOfClusters };

        const response = await fetch(`${SEGMENTATION_API_URL}/segmentation-insights`, {
            method: 'POST',
            headers: headers, // USAR HEADERS
            body: JSON.stringify(inputData),
        });

        if (!response.ok) {
            // ... (código existente, sem alterações)
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API Python.' }));
            console.error("Erro da API Python (Segmentação):", errorData);
            return { message: 'error', errorMessage: `Erro da API (${response.status}): ${errorData.detail || response.statusText}` };
        }

        const result: MarketSegmentationInsightsOutput = await response.json();

        if (!result || !result.textualInsights || !Array.isArray(result.segments)) {
            // ... (código existente, sem alterações)
            return { message: 'error', errorMessage: 'Resposta inválida da API Python.' };
        }

        return { message: 'success', analysis: result };

    } catch (error) {
        // ... (código existente, sem alterações)
        console.error("Erro ao chamar getSegmentationInsights:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { message: 'error', errorMessage: `Falha na comunicação com a API: ${errorMessage}` };
    }
}


export async function getSavedAnalyses(): Promise<HistoryListState> {
    try {
        const headers = await getAuthHeaders(); // PROTEGER
        const response = await fetch(`${SEGMENTATION_API_URL}/segmentation-analyses`, {
            method: 'GET',
            headers: headers, // USAR HEADERS
            cache: 'no-store',
        });

        if (!response.ok) {
            // ... (código existente, sem alterações)
            const errorData = await response.json().catch(() => ({ detail: 'Erro ao buscar histórico.' }));
            return { message: 'error', errorMessage: `Erro da API: ${errorData.detail || response.statusText}` };
        }

        const analyses: AnalysisMetadata[] = await response.json();
        return { message: 'success', analyses };

    } catch (error) {
        // ... (código existente, sem alterações)
        console.error("Erro ao chamar getSavedAnalyses:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { message: 'error', errorMessage: `Falha na comunicação com a API: ${errorMessage}` };
    }
}


export async function getSavedAnalysisById(id: number): Promise<SegmentationState> {
    if (!id) {
        // ... (código existente, sem alterações)
        return { message: 'error', errorMessage: 'ID da análise não fornecido.' };
    }

    try {
        const headers = await getAuthHeaders(); // PROTEGER
        const response = await fetch(`${SEGMENTATION_API_URL}/segmentation-analyses/${id}`, {
            method: 'GET',
            headers: headers, // USAR HEADERS
            cache: 'no-store',
        });

        if (!response.ok) {
            // ... (código existente, sem alterações)
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API.' }));
            if (response.status === 404) {
                return { message: 'error', errorMessage: 'Análise não encontrada.' };
            }
            return { message: 'error', errorMessage: `Erro da API (${response.status}): ${errorData.detail || response.statusText}` };
        }

        const result: MarketSegmentationInsightsOutput = await response.json();
        // Retorna o mesmo formato do SegmentationState
        // ... (código existente, sem alterações)
        return { message: 'success', analysis: result, analysisId: id };

    } catch (error) {
        console.error("Erro ao chamar getSavedAnalysisById:", error);
        // ... (código existente, sem alterações)
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return { message: 'error', errorMessage: `Falha na comunicação com a API: ${errorMessage}` };
    }
}