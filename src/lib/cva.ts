type ClassValue = string | number | boolean | undefined | null;
type ClassProp = ClassValue | Record<string, boolean> | ClassProp[];

type ConfigSchema = Record<string, Record<string, ClassProp>>;

type Config<T extends ConfigSchema> = {
  variants?: T;
  defaultVariants?: {
    [K in keyof T]?: keyof T[K] & string;
  };
  compoundVariants?: Array<{
    [K in keyof T]?: keyof T[K] & string;
  } & { class: ClassProp }>;
};

type VariantProps<C extends Config<ConfigSchema>> = {
  [K in keyof C['variants']]?: C['variants'][K] extends Record<infer V, ClassProp> ? V : never;
} & {
  [key: string]: string | undefined;
};

function cx(...inputs: ClassProp[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cx(...input);
      if (inner) classes.push(inner);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(' ');
}

function cva<T extends ConfigSchema>(config: Config<T>) {
  return (props: VariantProps<Config<T>> = {}) => {
    const { variants = {} as T, defaultVariants = {}, compoundVariants = [] } = config;
    
    // Get the variant classes
    const variantClasses = (Object.keys(variants) as Array<keyof T>).map((key) => {
      const variant = variants[key];
      const variantValue = props[key as string] || defaultVariants[key as keyof typeof defaultVariants];
      return variant[variantValue as string];
    });
    
    // Get the compound variant classes
    const compoundVariantClasses = compoundVariants
      .filter(({ class: _, ...variant }) =>
        Object.entries(variant).every(([key, value]) => props[key] === value)
      )
      .map(({ class: className }) => className)
      .filter(Boolean) as ClassProp[];
    
    return cx(...variantClasses, ...compoundVariantClasses);
  };
}

export { cva, cx };
export type { VariantProps, Config, ConfigSchema, ClassProp };
