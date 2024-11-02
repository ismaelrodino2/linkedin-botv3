import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";

export interface FormInputs {
  maxApplications: number;
  cvNameIndeed: string;
  name: string;
  role: string;
  location: string;
  email: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  experiences: string;
  languages: string;
  availability: string;
  desiredSalary: string;
  address: string;
  cvEnglish?: FileList; // Novo campo para CV em inglês
  cvPortuguese?: FileList; // Novo campo para CV em português
  clEnglish?: FileList; // Novo campo para CL em inglês
  clPortuguese?: FileList; // Novo campo para CL em português
}

const Profile: React.FC = () => {
  // Carregar os dados salvos do localStorage
  const savedData = localStorage.getItem("userProfile");
  const defaultValues = savedData ? JSON.parse(savedData) : {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues, // Passando os valores padrão aqui
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      // Filtra os arquivos dos outros dados antes de salvar no localStorage
      const { cvEnglish, cvPortuguese, clEnglish, clPortuguese, ...textData } =
        data;
      localStorage.setItem("userProfile", JSON.stringify(textData));
      console.log("Dados salvos no localStorage:", textData);

      // Função para enviar arquivos
      const uploadFile = async (
        fileList: FileList | undefined,
        fieldName: string
      ) => {
        if (!fileList || fileList.length === 0) return; // Ignora se não houver arquivo
        const file = fileList[0]; // Acessa o primeiro arquivo do FileList
        const formData = new FormData();
        formData.append("file", file, `${fieldName}.pdf`);

        const response = await fetch("http://localhost:3000/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erro ao enviar ${fieldName}`);
        } else {
          console.log(`Upload de ${fieldName} realizado com sucesso.`);
        }
      };

      // Upload dos arquivos (se existirem)
      await uploadFile(cvEnglish, "cv-en");
      await uploadFile(cvPortuguese, "cv-pt");
      await uploadFile(clEnglish, "cl-en");
      await uploadFile(clPortuguese, "cl-pt");

      toast("Dados e arquivos salvos!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar dados ou arquivos.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="maxApplications">Número máximo de aplicações</label>
          <input
            id="maxApplications"
            {...register("maxApplications", {
              required: "O número máximo de aplicações é obrigatório",
            })}
            className="input"
            type="number"
          />
          {errors.name && <p>{errors.name.message}</p>}
          <label htmlFor="cvNameIndeed">Nome do CV no Indeed</label>
          <input
            id="cvNameIndeed"
            {...register("cvNameIndeed", { required: "O nome do CV é obrigatório" })}
            className="input"
          />
          {errors.name && <p>{errors.name.message}</p>}
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            {...register("name", { required: "O nome é obrigatório" })}
            className="input"
          />
          {errors.name && <p>{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="role">Função</label>
          <input
            id="role"
            {...register("role", { required: "A função é obrigatória" })}
            className="input"
          />
          {errors.role && <p>{errors.role.message}</p>}
        </div>
        <div>
          <label htmlFor="location">Localização</label>
          <input
            id="location"
            {...register("location", { required: "A localização é obrigatória" })}
            className="input"
          />
          {errors.location && <p>{errors.location.message}</p>}
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            {...register("email", {
              required: "O email é obrigatório",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Endereço de email inválido",
              },
            })}
            className="input"
          />
          {errors.email && <p>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="linkedin">LinkedIn</label>
          <input
            id="linkedin"
            {...register("linkedin", { required: "O LinkedIn é obrigatório" })}
            className="input"
          />
          {errors.linkedin && <p>{errors.linkedin.message}</p>}
        </div>
        <div>
          <label htmlFor="portfolio">Portfólio</label>
          <input id="portfolio" {...register("portfolio")} className="input" />
        </div>
        <div>
          <label htmlFor="summary">Resumo</label>
          <textarea
            id="summary"
            {...register("summary", { required: "O resumo é obrigatório" })}
            className="textarea"
          />
          {errors.summary && <p>{errors.summary.message}</p>}
        </div>
        <div>
          <label htmlFor="experiences">Experiências</label>
          <textarea
            id="experiences"
            {...register("experiences")}
            className="textarea"
          />
        </div>
        <div>
          <label htmlFor="languages">Idiomas</label>
          <input
            id="languages"
            {...register("languages", { required: "Os idiomas são obrigatórios" })}
            className="input"
          />
          {errors.languages && <p>{errors.languages.message}</p>}
        </div>
        <div>
          <label htmlFor="availability">Disponibilidade</label>
          <input
            id="availability"
            {...register("availability")}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="desiredSalary">
            Salário desejado (número + moeda)
          </label>
          <input
            id="desiredSalary"
            {...register("desiredSalary", {
              required: "O salário desejado é obrigatório",
            })}
            className="input"
          />
          {errors.desiredSalary && <p>{errors.desiredSalary.message}</p>}
        </div>
        <div>
          <label htmlFor="address">Endereço</label>
          <input id="address" {...register("address")} className="input" />
        </div>

        <div>
          <label htmlFor="cvEnglish">CV em Inglês</label>
          <input
            type="file"
            id="cvEnglish"
            {...register("cvEnglish")}
            className="input"
          />
          {errors.cvEnglish && <p>{errors.cvEnglish.message}</p>}
        </div>
        <div>
          <label htmlFor="cvPortuguese">CV em Português</label>
          <input
            type="file"
            id="cvPortuguese"
            {...register("cvPortuguese")}
            className="input"
          />
          {errors.cvPortuguese && <p>{errors.cvPortuguese.message}</p>}
        </div>
        <div>
          <label htmlFor="clEnglish">Cover Letter em Inglês</label>
          <input
            type="file"
            id="clEnglish"
            {...register("clEnglish")}
            className="input"
          />
          {errors.clEnglish && <p>{errors.clEnglish.message}</p>}
        </div>
        <div>
          <label htmlFor="clPortuguese">Cover Letter em Português</label>
          <input
            type="file"
            id="clPortuguese"
            {...register("clPortuguese")}
            className="input"
          />
          {errors.clPortuguese && <p>{errors.clPortuguese.message}</p>}
        </div>

        <button type="submit" className="button">
          Enviar
        </button>
      </form>
    </div>
  );
};

export default Profile;
