import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import "./Login.css";
import { Link } from 'react-router-dom';

// Esquema de validação do Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
});

// Tipagem do formulário
type LoginFormInputs = z.infer<typeof loginSchema>;

function Login() {
  // Hook do React Hook Form com Zod como resolver de validação
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // Função para lidar com o envio do formulário
  const onSubmit = (data: LoginFormInputs) => {
    console.log('Dados do login:', data);
  };

  return (
    <div className="login-container full-height">
      <div className="login-left">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="separator">
          <div className="line"></div>
          <span className="or">ou</span>
          <div className="line"></div>
        </div>
      </div>
      <div className="login-right" />
      <Link to="/">dad</Link>

    </div>
  );
}

export default Login;
