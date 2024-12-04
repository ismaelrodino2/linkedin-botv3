import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import * as z from "zod"
import { Button } from "../components/ui/button/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form/form"
import { Input } from "../components/ui/input/input"
import { Textarea } from "../components/ui/textarea/textarea"
import { Checkbox } from "../components/ui/checkbox/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select/select"
import styles from './profile.module.css'

const languageLevels = ["Basic", "Intermediate", "Advanced", "Native"] as const
const softwareLevels = ["Basic", "Intermediate", "Advanced"] as const

const formSchema = z.object({
  aboutMe: z.string().min(10, "About me should be at least 10 characters"),
  experience: z.string().min(10, "Experience should be at least 10 characters"),
  links: z.object({
    linkedin: z.string().url("Must be a valid URL"),
    portfolio: z.string().url("Must be a valid URL"),
  }),
  availability: z.object({
    canTravel: z.boolean(),
    canWorkInPerson: z.boolean(),
    needsSponsor: z.boolean(),
    immediateStart: z.boolean(),
    canWorkHybrid: z.boolean(),
  }),
  languages: z.array(z.object({
    language: z.string(),
    level: z.enum(languageLevels),
  })),
  softwares: z.array(z.object({
    name: z.string(),
    yearsOfExperience: z.string(),
    level: z.enum(softwareLevels),
  })),
  softSkills: z.string().min(10, "Soft skills should be at least 10 characters"),
  hardSkills: z.string().min(10, "Hard skills should be at least 10 characters"),
  proficiency: z.string().min(10, "Proficiency should be at least 10 characters"),
  cv1: z.any(),
  cv2: z.any(),
})

export default function ProfileForm() {
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      languages: [{ language: "", level: "Basic" }],
      softwares: [{ name: "", yearsOfExperience: "", level: "Basic" }],
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.section}>
          <FormField
            control={methods.control}
            name="aboutMe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Me</FormLabel>
                <FormControl>
                  <Textarea {...field} style={{width: '100%', height: '100%', boxSizing: 'border-box'}} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <div className={styles.linksGrid}>
            <FormField
              control={methods.control}
              name="links.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="links.portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3>Availability</h3>
          <div className={styles.checkboxGrid}>
            <FormField
              control={methods.control}
              name="availability.canTravel"
              render={({ field }) => (
                <FormItem className={styles.checkboxItem}>
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Available to travel?</FormLabel>
                </FormItem>
              )}
            />
            {/* Similar FormFields for other checkboxes */}
          </div>
        </div>

        <div className={styles.section}>
          <h3>Languages</h3>
          <div className={styles.languagesGrid}>
            {methods.watch('languages').map((_, index) => (
              <div key={index} className={styles.languageRow}>
                <FormField
                  control={methods.control}
                  name={`languages.${index}.language`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Language" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name={`languages.${index}.level`}
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </div>
            ))}
            <Button 
              type="button"
              onClick={() => methods.setValue('languages', [...methods.watch('languages'), { language: "", level: "Basic" }])}
            >
              Add Language
            </Button>
          </div>
        </div>

        {/* Similar structure for softwares section */}

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
                  <FormLabel>CV 1</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />
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
                  <FormLabel>CV 2</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  )
}
