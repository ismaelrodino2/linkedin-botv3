import "./login.css";
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
  const { login } = useAuth();

  // Handler de submissão do formulário
  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);

    try {
      await login(data);
      // Sucesso no envio do OTP
    } catch (error) {
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <Card className="first-section-card">
        <div className="first-section">
          <CardHeader className="header">
            <CardTitle
              style={{
                color: "#9113CC",
                font: "var(--font-family-lora)",
                fontWeight: 400,
                fontSize: 32,
                lineHeight: "39.24px",
                letterSpacing: "11px",
              }}
            >
              Wish Apply
            </CardTitle>
          </CardHeader>
          <CardContent className="content-first-section">
            <FormProvider {...methods}>
              <Form
                onSubmit={methods.handleSubmit(onSubmit)}
                style={{width: '100%'}}
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
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Campo de Senha */}
                <FormField
                  name="password"
                  control={methods.control}
                  render={({ field }) => (
                    <FormItem id="pass-item">
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Digite sua senha"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Botão de Enviar */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    type="submit"
                    loading={loading}
                    style={{ marginTop: 29 }}
                  >
                    Entrar
                  </Button>
                </div>
              </Form>
            </FormProvider>
          </CardContent>
        </div>
      </Card>
      <Card className="second-section"></Card>
    </div>
  );
}
