"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";

export const RBACContext = createContext();

export function RBACProvider({ children }) {
  const { permissions: userPermissions } = useContext(AuthContext);

  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (!userPermissions || userPermissions.length === 0) {
      setModules([]);
      setSubmodules([]);
      setActions([]);
      return;
    }

    if (userPermissions.includes("*")) {
      setModules(["*"]);
      setSubmodules(["*"]);
      setActions(["*"]);
      return;
    }

    const modSet = new Set();
    const subSet = new Set();
    const actionSet = new Set();

    userPermissions.forEach((p) => {
      const parts = p.split(":");
      const [module, submodule, action] = parts;

      if (module) modSet.add(module);
      if (submodule) subSet.add(`${module}:${submodule}`);
      if (action) actionSet.add(`${module}:${submodule}:${action}`);
    });

    setModules([...modSet]);
    setSubmodules([...subSet]);
    setActions([...actionSet]);

  }, [userPermissions]);

  const canAccessModule = (module) =>
    modules.includes("*") || modules.includes(module);

  const canAccessSubmodule = (submodule) =>
    submodules.includes("*") || submodules.includes(submodule);

  const canPerform = (action, module, submodule) => {
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
      }}
    >
      {children}
    </RBACContext.Provider>
  );
}
