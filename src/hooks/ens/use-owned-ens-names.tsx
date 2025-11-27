import { Address, namehash } from "viem";
import { useEnsClient } from "./use-ens-client";
import {
  GetNamesForAddressReturnType,
  Name,
  NameWithRelation,
} from "@ensdomains/ensjs/subgraph";
import { EnsName } from "@/types";
import HEALTH_LIST from "./healed-names.json";

export const useOwnedEnsNames = () => {
  const ensClient = useEnsClient();

  const fetchEnsSubnamesAsync = async (parentName: string) => {
    const allSubnames = await ensClient.getSubnames({
      name: parentName,
      allowDeleted: false,
      allowExpired: false,
      // We will only show 100 regular ENS subnames
      pageSize: 500,
    });
    return allSubnames.map((subname) => toEnsName(subname));
  };

  const fetchEnsNamesAsync = async (ownerAddress: Address) => {
    const allNames = await ensClient.getNamesForAddress({
      address: ownerAddress,
      pageSize: 999,
      filter: {
        allowDeleted: false,
        allowExpired: false,
        allowReverseRecord: false,
        owner: true,
        registrant: false,
        resolvedAddress: false,
        wrappedOwner: true,
      },
    });
    return toEnsNames(allNames);
  };

  const toEnsName = (_graphName: NameWithRelation | Name): EnsName => {
    let graphName = _graphName;
    const nameLevel =
      (graphName.parentName || "eth").split(".").length === 1 ? 2 : 3;
    let isWrapped = false;

    if ((graphName as NameWithRelation).relation) {
      isWrapped = (graphName as NameWithRelation).relation.wrappedOwner
        ? true
        : false;
    }

    if (isUnhealthyName(_graphName)) {
      graphName = healName(_graphName);
    }

    return {
      createdAt: graphName.createdAt?.date.getTime() || 0,
      expiry: graphName.expiryDate?.date.getTime() || 0,
      label: graphName.labelName || "[unknown-label]",
      name: graphName.truncatedName || graphName.name || "[unknown-name]",
      namehash: namehash(graphName.name || ""),
      level: nameLevel,
      parentName: graphName.parentName || "[unknown-parent]",
      isWrapped,
      owner: graphName.owner,
    };
  };

  const isUnhealthyName = (name: NameWithRelation | Name) => {
    return name.name?.startsWith("[");
  };

  const healName = (name: NameWithRelation | Name) => {
    const healthlist = HEALTH_LIST as Record<string, string>;
    const healedLabel = healthlist[name.labelhash || ""];
    if (healedLabel && name.name !== null) {
      const _newName = { ...name };
      _newName.labelName = healedLabel;
      let fullHealedName = healedLabel;
      const split = name.name.split(".");

      for (let i = 1; i < split.length; i++) {
        fullHealedName += "." + split[i];
      }
      _newName.name = fullHealedName;
      _newName.truncatedName = fullHealedName;
      return _newName;
    }

    return name;
  };

  const toEnsNames = (result: GetNamesForAddressReturnType) => {
    const names: EnsName[] = [];
    const subnames: EnsName[] = [];
    result.forEach((graphName) => {
      const name: EnsName = toEnsName(graphName);

      if (name.level === 2) {
        names.push(name);
      } else {
        subnames.push(name);
      }
    });

    return {
      names,
      subnames,
    };
  };

  return {
    fetchEnsNamesAsync,
    fetchEnsSubnamesAsync,
  };
};
