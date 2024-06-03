import React, { createContext, useCallback, useContext, useState } from 'react';

const FormDataContext = createContext();

export const useFormData = () => useContext(FormDataContext);

export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState({ email: '', location: false });

  const updateFormData = useCallback((newData) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...newData,
    }));
  }, []);

  return (
    <FormDataContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};
