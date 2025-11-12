'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateProfile } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Salvar Alterações
    </Button>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [state, formAction] = useFormState(updateProfile, undefined);

  useEffect(() => {
    // Se a atualização foi bem-sucedida, atualiza o contexto
    if (state?.success && state.user) {
      setUser(state.user);
    }
  }, [state, setUser]);


  return (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Perfil</h1>
            <p className="text-muted-foreground">
                Atualize seus dados pessoais e avatar.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Seus Dados</CardTitle>
                <CardDescription>
                    Informações da sua conta.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user?.avatar_url ?? ''} alt={user?.name ?? 'Avatar'} />
                            <AvatarFallback>
                                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="avatar_url">URL do Avatar</Label>
                            <Input
                            id="avatar_url"
                            name="avatar_url"
                            type="text"
                            placeholder="https://sua-imagem.com/avatar.png"
                            defaultValue={user?.avatar_url ?? ''}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Seu nome"
                        defaultValue={user?.name ?? ''}
                        required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="email">Email (não pode ser alterado)</Label>
                        <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user?.email ?? ''}
                        disabled
                        />
                    </div>

                    {state?.error && (
                        <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    {state?.success && (
                        <Alert>
                        <Check className="h-4 w-4" />
                        <AlertTitle>Sucesso!</AlertTitle>
                        <AlertDescription>Seu perfil foi atualizado.</AlertDescription>
                        </Alert>
                    )}

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    </div>
  );
}