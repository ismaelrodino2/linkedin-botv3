import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Button } from "../components/ui/button/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form/form";
import { Input } from "../components/ui/input/input";
import { Textarea } from "../components/ui/textarea/textarea";
import { Checkbox } from "../components/ui/checkbox/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select/select";
import styles from "./profile.module.css";
import { TrashIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useState, useEffect } from "react";
import { useAuth } from "../context/auth-context";

const languageLevels = ["Basic", "Intermediate", "Advanced", "Native"] as const;
const softwareLevels = ["Basic", "Intermediate", "Advanced"] as const;

const formSchema = z.object({
  aboutMe: z.string().min(10, "About me should be at least 10 characters"),
  experience: z.string().min(10, "Experience should be at least 10 characters"),
  links: z.array(
    z.object({
      name: z.string(),
      url: z.string().url("Must be a valid URL"),
    })
  ),
  availability: z.object({
    canTravel: z.boolean().optional(),
    canWorkInPerson: z.boolean().optional(),
    needsSponsor: z.boolean().optional(),
    immediateStart: z.boolean().optional(),
    canWorkHybrid: z.boolean().optional(),
  }),
  languages: z.array(
    z.object({
      language: z.string(),
      level: z.enum(languageLevels),
    })
  ),
  softwares: z.array(
    z.object({
      name: z.string(),
      yearsOfExperience: z.string(),
      level: z.enum(softwareLevels),
    })
  ),
  softSkills: z
    .string()
    .min(10, "Soft skills should be at least 10 characters"),
  hardSkills: z
    .string()
    .min(10, "Hard skills should be at least 10 characters"),
  proficiency: z
    .string()
    .min(10, "Proficiency should be at least 10 characters"),
  cv1: z.any().optional(),
  cv2: z.any().optional(),
  coverLetter1: z.any().optional(),
  coverLetter2: z.any().optional(),
  technologies: z.array(
    z.object({
      name: z.string(),
      yearsOfExperience: z.string(),
    })
  ),
  desiredSalaries: z.array(
    z.object({
      country: z.string().min(1, "Country is required"),
      amount: z.string().min(1, "Salary amount is required"),
    })
  ),
});

const FileDisplay = ({ url, label }: { url: string | null, label: string }) => {
  if (!url) return null;
  
  return (
    <div className={styles.fileDisplay}>
      <span>{label}:</span>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={styles.fileLink}
      >
        View current file
      </a>
    </div>
  );
};

export default function ProfileForm() {
  const [cookies] = useCookies(["authToken"]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      aboutMe: user?.account?.aboutMe || "",
      experience: user?.account?.experience || "",
      links: user?.account?.links || [{ name: "", url: "" }],
      availability: user?.account?.availability || {
        canTravel: false,
        canWorkInPerson: false,
        needsSponsor: false,
        immediateStart: false,
        canWorkHybrid: false,
      },
      languages: user?.account?.languages || [{ language: "", level: "Basic" }],
      softwares: user?.account?.softwares || [{ 
        name: "", 
        yearsOfExperience: "", 
        level: "Basic" 
      }],
      technologies: user?.account?.technologies || [{ 
        name: "", 
        yearsOfExperience: "" 
      }],
      softSkills: user?.account?.softSkills || "",
      hardSkills: user?.account?.hardSkills || "",
      proficiency: user?.account?.proficiency || "",
      cv1: undefined,
      cv2: undefined,
      coverLetter1: undefined,
      coverLetter2: undefined,
      desiredSalaries: user?.account?.desiredSalaries ?? [{ 
        country: "", 
        amount: "" 
      }],
    },
  });

  useEffect(() => {
    if (user?.account) {
      methods.reset({
        aboutMe: user.account.aboutMe,
        experience: user.account.experience,
        links: user.account.links,
        availability: user.account.availability,
        languages: user.account.languages,
        softwares: user.account.softwares,
        technologies: user.account.technologies,
        softSkills: user.account.softSkills,
        hardSkills: user.account.hardSkills,
        proficiency: user.account.proficiency,
        desiredSalaries: user.account.desiredSalaries ?? [{ 
          country: "", 
          amount: "" 
        }],
      });
    }
  }, [user, methods]);

  const existingFiles = {
    cv1: user?.account?.cv1,
    cv2: user?.account?.cv2,
    coverLetter1: user?.account?.coverLetter1,
    coverLetter2: user?.account?.coverLetter2,
  };

  const {
    formState: { errors },
  } = methods;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("cv1", values.cv1);
      formData.append("cv2", values.cv2);
      formData.append("coverLetter1", values.coverLetter1);
      formData.append("coverLetter2", values.coverLetter2);

      const { cv1, cv2, coverLetter1, coverLetter2, ...dataWithoutFiles } =
        values;

      formData.append("dataWithoutFiles", JSON.stringify(dataWithoutFiles));
      const token = cookies.authToken;
      console.log("token", token);

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/create-account`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: token, // Envia apenas o token, sem o prefixo 'Bearer '
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // const result = await response.json();

      toast("Your profile has been created successfully.", { type: "success" });
      methods.reset();
    } catch (error) {
      console.error("Submission error:", error);
      toast("Error", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const onError = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    toast("Please check all required fields", { type: "warning" });
  };

  return (
    <div
      style={{
        height: "100%",
        minHeight: "calc(100vh - 70px)",
        backgroundColor: "var(--bg-container)",
      }}
    >
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit, onError)}
          className={styles.form}
        >
          <div className={styles.section}>
            <FormField
              control={methods.control}
              name="aboutMe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Me</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      style={{
                        width: "100%",
                        height: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.section}>
            <h3>Desired Salary</h3>
            <div className={styles.salaryGrid}>
              {methods.watch("desiredSalaries").map((_, index) => (
                <div key={index} className={styles.salaryItem}>
                  <FormField
                    control={methods.control}
                    name={`desiredSalaries.${index}.country`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`desiredSalaries.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      const currentSalaries = methods.getValues("desiredSalaries");
                      if (currentSalaries.length > 1) {
                        const newSalaries = [...currentSalaries];
                        newSalaries.splice(index, 1);
                        methods.setValue("desiredSalaries", newSalaries);
                      }
                    }}
                    style={{ marginLeft: "8px", marginBottom: 8 }}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                style={{
                  alignSelf: "self-end",
                }}
                onClick={() =>
                  methods.setValue("desiredSalaries", [
                    ...methods.watch("desiredSalaries"),
                    { country: "", amount: "" },
                  ])
                }
              >
                Add Salary
              </Button>
            </div>
          </div>
          <div className={styles.section}>
            <FormField
              control={methods.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.section}>
            <h3>Links</h3>
            <div className={styles.languagesGrid}>
              {methods.watch("links").map((_, index) => (
                <div key={index} className={styles.languageRow}>
                  <FormField
                    control={methods.control}
                    name={`links.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. LinkedIn, Portfolio, GitHub"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name={`links.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                style={{
                  alignSelf: "self-end",
                }}
                onClick={() =>
                  methods.setValue("links", [
                    ...methods.watch("links"),
                    { name: "", url: "" },
                  ])
                }
              >
                Add Link
              </Button>
            </div>
          </div>
          <div className={styles.section}>
            <h3>Availability</h3>
            <div className={styles.availabilityGrid}>
              <FormField
                control={methods.control}
                name="availability.canTravel"
                render={({ field }) => (
                  <FormItem className={styles.availabilityItem}>
                    <div className={styles.availabilityLabel}>To Travel ?</div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="availability.canWorkInPerson"
                render={({ field }) => (
                  <FormItem className={styles.availabilityItem}>
                    <div className={styles.availabilityLabel}>
                      To work in person ?
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="availability.needsSponsor"
                render={({ field }) => (
                  <FormItem className={styles.availabilityItem}>
                    <div className={styles.availabilityLabel}>
                      If approved, would I need a Sponsor ?
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="availability.immediateStart"
                render={({ field }) => (
                  <FormItem className={styles.availabilityItem}>
                    <div className={styles.availabilityLabel}>
                      For immediate start ?
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="availability.canWorkHybrid"
                render={({ field }) => (
                  <FormItem className={styles.availabilityItem}>
                    <div className={styles.availabilityLabel}>
                      To work in a hybrid way ?
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className={styles.section}>
            <h3>Languages</h3>
            <div className={styles.languagesGrid}>
              {methods.watch("languages").map((_, index) => (
                <div key={index} className={styles.languageRow}>
                  <FormField
                    control={methods.control}
                    name={`languages.${index}.language`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Language" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className={styles.fieldWithButton}>
                    <FormField
                      control={methods.control}
                      name={`languages.${index}.level`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {languageLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        const currentLanguages = methods.getValues("languages");
                        if (currentLanguages.length > 1) {
                          const newLanguages = [...currentLanguages];
                          newLanguages.splice(index, 1);
                          methods.setValue("languages", newLanguages);
                        }
                      }}
                      style={{ marginLeft: "8px", marginBottom: 8 }}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                style={{
                  alignSelf: "self-end",
                }}
                onClick={() =>
                  methods.setValue("languages", [
                    ...methods.watch("languages"),
                    { language: "", level: "Basic" },
                  ])
                }
              >
                Add Language
              </Button>
            </div>
          </div>
          <div className={styles.section}>
            <h3>Technologies</h3>
            <div className={styles.languagesGrid}>
              {methods.watch("technologies").map((_, index) => (
                <div key={index} className={styles.languageRow}>
                  <FormField
                    control={methods.control}
                    name={`technologies.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technology</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Technology" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className={styles.fieldWithButton}>
                    <FormField
                      control={methods.control}
                      name={`technologies.${index}.yearsOfExperience`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Years of Experience"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        const currentTechnologies =
                          methods.getValues("technologies");
                        if (currentTechnologies.length > 1) {
                          const newTechnologies = [...currentTechnologies];
                          newTechnologies.splice(index, 1);
                          methods.setValue("technologies", newTechnologies);
                        }
                      }}
                      style={{ marginLeft: "8px", marginBottom: 8 }}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                style={{
                  alignSelf: "self-end",
                }}
                onClick={() =>
                  methods.setValue("technologies", [
                    ...(methods.watch("technologies") || []),
                    { name: "", yearsOfExperience: "" },
                  ])
                }
              >
                Add Technology
              </Button>
            </div>
          </div>
          <div className={styles.section}>
            <FormField
              control={methods.control}
              name="softSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soft Skills</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.section}>
            <FormField
              control={methods.control}
              name="hardSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hard Skills</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.section}>
            <FormField
              control={methods.control}
              name="proficiency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proficiency</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.section}>
            <h3>CV Upload</h3>
            <div className={styles.uploadGrid}>
              <FormField
                control={methods.control}
                name="cv1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV Portuguese</FormLabel>
                    <FileDisplay 
                      url={existingFiles.cv1 ?? null} 
                      label="Current CV"
                    />
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="cv2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV English</FormLabel>
                    <FileDisplay 
                      url={existingFiles.cv2 ?? null} 
                      label="Current CV"
                    />
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className={styles.section}>
            <h3>Cover Letter Upload</h3>
            <div className={styles.uploadGrid}>
              <FormField
                control={methods.control}
                name="coverLetter1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter Portuguese</FormLabel>
                    <FileDisplay 
                      url={existingFiles.coverLetter1 ?? null}
                      label="Current Cover Letter"
                    />
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="coverLetter2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter English</FormLabel>
                    <FileDisplay 
                      url={existingFiles.coverLetter2 ?? null} 
                      label="Current Cover Letter"
                    />
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row-reverse" }}>
            <Button size="lg" type="submit" loading={loading}>
              Submit
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
