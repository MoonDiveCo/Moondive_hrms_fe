"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";

export const RBACContext = createContext();

export function RBACProvider({ children }) {
  const { permissions: userPermissions,isSignedIn , loading: authLoading,allUserPermissions } = useContext(AuthContext);

  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [actions, setActions] = useState([]);
  const [rbacLoading, setRbacLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

     if (!isSignedIn) {
      setModules([]);
      setSubmodules([]);
      setActions([]);
      setRbacLoading(false);
      return;
    }

    if (!userPermissions || userPermissions.length === 0) {
      setModules([]);
      setSubmodules([]);
      setActions([]);
      setRbacLoading(false);
      return;
    }

    if (userPermissions.includes("*")) {
      setModules(["*"]);
      setSubmodules(["*"]);
      setActions(["*"]);
      setRbacLoading(false);
      return;
    }

    const modSet = new Set();
    const subSet = new Set();
    const actionSet = new Set();

        [...allUserPermissions].forEach((p) => {
      const parts = p.split(":");
      const [module, submodule, action] = parts;

      if (module) modSet.add(module);
      if (submodule) subSet.add(`${module}:${submodule}`);
      if (action) actionSet.add(`${module}:${submodule}:${action}`);
    });

    setModules([...modSet]);
    setSubmodules([...subSet]);
    setActions([...actionSet]);
    setRbacLoading(false);

  }, [userPermissions, isSignedIn, authLoading]);  
  const canAccessModule = (module) =>
    modules.includes("*") || modules.includes(module);

  const canAccessSubmodule = (submodule) =>
    submodules.includes("*") || submodules.includes(submodule);

  const canPerform= (action, module, submodule) => {
    if (actions.includes("*")) return true;

    const full = `${module}:${submodule}:${action}`;
    return actions.includes(full);
  };

  return (
    <RBACContext.Provider
      value={{
        permissions: userPermissions,
        modules,
        submodules,
        actions,
        canAccessModule,
        canAccessSubmodule,
        canPerform,
        rbacLoading,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
}
