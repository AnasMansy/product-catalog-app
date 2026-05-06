'use client';

import { useEffect, useState } from "react";
import { Provider } from "react-redux";

import { useAppDispatch } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/authSlice";
import { makeStore, type AppStore } from "@/store/store";

function StoreHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(hydrateAuth());
  }, [dispatch]);

  return null;
}

export default function StoreProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [store] = useState<AppStore>(() => makeStore());

  return (
    <Provider store={store}>
      <StoreHydrator />
      {children}
    </Provider>
  );
}
