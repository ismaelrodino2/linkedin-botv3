import { User } from '../types/user';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

// Realiza o login do usuário
export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch(`${SERVER_URL}/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

// Gera um token JWT para o usuário
export async function generateToken(user: User): Promise<string | null> {
  try {
    const response = await fetch(`${SERVER_URL}/encode-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { id: user.id } }),
    });

    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error("Token generation error:", error);
    return null;
  }
}

// Busca os dados do usuário usando o token
export async function getUserData(token: string): Promise<User | null> {
  try {
    const response = await fetch(`${SERVER_URL}/get-user-account`, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error('Invalid token');
    
    const { user } = await response.json();
    return user;
  } catch (error) {
    console.error("Get user data error:", error);
    return null;
  }
}

// Atualiza os dados do usuário
export async function updateUser(token: string, data: Partial<User>): Promise<boolean> {
  console.log("qweqwe", data)
  try {
    const response = await fetch(`${SERVER_URL}/update-user`, {
      method: 'PUT',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    return response.ok;
  } catch (error) {
    console.error("Update user error:", error);
    return false;
  }
} 