import { cn } from './utils';

type ClassValue = string | number | boolean | undefined | null;
type ClassProp = ClassValue | Record<string, boolean> | ClassProp[];

type ConfigSchema = Record<string, Record<string, ClassProp>>;

type Config<T extends ConfigSchema> = {
  variants?: T;
  defaultVariants?: {
    [K in keyof T]?: keyof T[K];
  };
  compoundVariants?: Array<{
    [K in keyof T]?: keyof T[K];
  } & { class: ClassProp }>;
};

type VariantProps<C extends Config<any>> = {
  [K in keyof C['variants']]?: keyof C['variants'][K];
};

function cx(...inputs: ClassProp[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string' || typeof input === 'number') {
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
  const { variants = {}, defaultVariants = {}, compoundVariants = [] } = config;
  
  return (props: VariantProps<Config<T>> = {}) => {
    const variantKeys = Object.keys(variants);
    const variantClasses = variantKeys
      .filter(key => props[key])
      .map(key => variants[key][props[key] as string])
      .filter(Boolean);
    
    const compoundClassNames = compoundVariants
      .filter(item => {
        return Object.entries(item).every(([key, value]) => {
          if (key === 'class') return true;
          return props[key] === value;
        });
      })
      .map(item => item.class);
    
    const defaultClasses = Object.entries(defaultVariants)
      .filter(([key]) => !(key in props))
      .map(([key, value]) => variants[key]?.[value as string])
      .filter(Boolean);
    
    return cn(...variantClasses, ...compoundClassNames, ...defaultClasses);
  };
}

export { cva, cx };
export type { VariantProps };
