declare module 'class-variance-authority/types' {
  type ClassProp =
    | string
    | number
    | boolean
    | undefined
    | null
    | Record<string, any>
    | ClassProp[];

  type ClassValue = ClassProp | ClassProp[];

  type ClassPropValue = string | number | boolean | undefined | null;

  type ClassDictionary = Record<string, any>;

  type ClassArray = ClassValue[];

  type ClassName = string | number | boolean | undefined | null;

  type ClassNames = ClassName | ClassName[] | ClassDictionary;

  type VariantProps<T> = T extends (props: infer P) => any ? P : never;

  type Cx = (...classNames: ClassValue[]) => string;

  type CvaFn = {
    (config?: CvaConfig): Cx;
    config: CvaConfig;
    classNames: (props?: Record<string, any>) => string;
  };

  interface CvaConfig {
    base?: ClassValue;
    variants?: {
      [key: string]: {
        [key: string]: ClassValue;
      };
    };
    defaultVariants?: {
      [key: string]: string | number | boolean | undefined | null;
    };
    compoundVariants?: Array<{
      [key: string]: string | number | boolean | undefined | null;
      class: ClassValue;
    }>;
  }

  interface CvaOptions {
    classProp?: string;
    classPropSeparator?: string;
  }

  function cva(
    config: CvaConfig | ClassValue,
    options?: CvaOptions
  ): Cx;

  export type { VariantProps, CvaConfig, CvaOptions };
  export { cva };
  export default cva;
}
