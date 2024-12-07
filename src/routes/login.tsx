import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
} from "../components/ui/form/form";
import { Input } from "../components/ui/input/input";
import { Button } from "../components/ui/button/button";
import { useAuth } from "../context/auth-context";

// Definição do schema usando Zod
const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// Definindo o tipo dos dados do formulário a partir do schema do Zod
export type SignInFormData = z.infer<typeof signInSchema>;

export default function Login() {
  const methods = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  // Criação do formulário usando react-hook-form

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { login } = useAuth();

  // Handler de submissão do formulário
  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      await login(data);
      // Sucesso no envio do OTP
    } catch (error) {
      console.error("Erro no login:", error);
      setErrorMessage("Algo deu errado. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card style={{height: '100%',  minHeight: 'calc(100vh - 70px)'}}>
        <CardHeader>
          <CardTitle className="text-xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <Form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Campo de E-mail */}
              <FormField
                name="email"
                control={methods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Digite seu e-mail"
                        className="input-class" // Adicione suas classes de estilo
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Digite seu endereço de e-mail registrado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de Senha */}
              <FormField
                name="password"
                control={methods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua senha"
                        className="input-class" // Adicione suas classes de estilo
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Sua senha deve ter pelo menos 6 caracteres.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botão de Enviar */}
              <div>
                <Button
                  type="submit"
                  loading={loading}
                  className="button-class" // Adicione suas classes de estilo
                >
                  Entrar
                </Button>
              </div>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
  );
}
