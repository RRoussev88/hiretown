import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import type {
  SafeParseError,
  SafeParseReturnType,
  SafeParseSuccess,
  ZodError,
  ZodType,
} from "zod";

export const useValidatedInput = (
  predicate: (text: string) => boolean
): [string, Dispatch<SetStateAction<string>>, boolean] => {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(predicate(value));
  }, [value, predicate]);

  return [value, setValue, isValid];
};

export const useValidate = <Out = any>(
  schema: ZodType<Out>
): [Out, Dispatch<SetStateAction<Out>>, boolean, ZodError, Out] => {
  const [value, setValue] = useState<Out>("" as Out);
  const [parsedResult, setParsedResult] = useState<
    SafeParseReturnType<typeof value, Out>
  >({ success: true, data: "" } as SafeParseReturnType<typeof value, Out>);

  useEffect(() => {
    setParsedResult(schema.safeParse(value));
  }, [value, schema]);

  return [
    value,
    setValue,
    parsedResult.success,
    (parsedResult as SafeParseError<Out>).error ?? null,
    (parsedResult as SafeParseSuccess<Out>).data,
  ];
};
