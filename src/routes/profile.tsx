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

      toast("Data and files saved!");
    } catch (err) {
      console.error(err);
      toast.error("Error saving data or files.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="maxApplications">Max applications number</label>
          <input
            id="maxApplications"
            {...register("maxApplications", {
              required: "max aplications is required",
            })}
            className="input"
            type="number"
          />
          {errors.name && <p>{errors.name.message}</p>}
          <label htmlFor="cvNameIndeed">CV name in indeed</label>
          <input
            id="cvNameIndeed"
            {...register("cvNameIndeed", { required: "CV name is required" })}
            className="input"
          />
          {errors.name && <p>{errors.name.message}</p>}
          <label htmlFor="name">Name</label>
          <input
            id="name"
            {...register("name", { required: "Name is required" })}
            className="input"
          />
          {errors.name && <p>{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <input
            id="role"
            {...register("role", { required: "Role is required" })}
            className="input"
          />
          {errors.role && <p>{errors.role.message}</p>}
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            {...register("location", { required: "Location is required" })}
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
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
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
            {...register("linkedin", { required: "LinkedIn is required" })}
            className="input"
          />
          {errors.linkedin && <p>{errors.linkedin.message}</p>}
        </div>
        <div>
          <label htmlFor="portfolio">Portfolio</label>
          <input id="portfolio" {...register("portfolio")} className="input" />
        </div>
        <div>
          <label htmlFor="summary">Summary</label>
          <textarea
            id="summary"
            {...register("summary", { required: "Summary is required" })}
            className="textarea"
          />
          {errors.summary && <p>{errors.summary.message}</p>}
        </div>
        <div>
          <label htmlFor="experiences">Experiences</label>
          <textarea
            id="experiences"
            {...register("experiences")}
            className="textarea"
          />
        </div>
        <div>
          <label htmlFor="languages">Languages</label>
          <input
            id="languages"
            {...register("languages", { required: "Languages are required" })}
            className="input"
          />
          {errors.languages && <p>{errors.languages.message}</p>}
        </div>
        <div>
          <label htmlFor="availability">Availability</label>
          <input
            id="availability"
            {...register("availability")}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="desiredSalary">
            Desired Salary (number + currency)
          </label>
          <input
            id="desiredSalary"
            {...register("desiredSalary", {
              required: "Desired Salary is required",
            })}
            className="input"
          />
          {errors.desiredSalary && <p>{errors.desiredSalary.message}</p>}
        </div>
        <div>
          <label htmlFor="address">Address</label>
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
          <label htmlFor="clEnglish">CL em Inglês</label>
          <input
            type="file"
            id="clEnglish"
            {...register("clEnglish")}
            className="input"
          />
          {errors.clEnglish && <p>{errors.clEnglish.message}</p>}
        </div>
        <div>
          <label htmlFor="clPortuguese">CL em Português</label>
          <input
            type="file"
            id="clPortuguese"
            {...register("clPortuguese")}
            className="input"
          />
          {errors.clPortuguese && <p>{errors.clPortuguese.message}</p>}
        </div>

        <button type="submit" className="button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Profile;
