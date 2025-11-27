import axios from "axios";
import { useEffect, useState } from "react";
import { Address } from "viem";

export interface EFPState {
  isFetching: boolean;
  isError: boolean;
  followers: number;
  following: number;
  primaryList?: string;
}

const EFP_API = "https://api.ethfollow.xyz";

const getEfpLists = (principal: Address) => {
  return axios
    .get<{ primary_list: string }>(`${EFP_API}/api/v1/users/${principal}/lists`)
    .then((res) => res.data);
};

const getEfpStats = (efpList: string) => {
  return axios
    .get<{ followers_count: number; following_count: number }>(
      `${EFP_API}/api/v1/lists/${efpList}/stats`
    )
    .then((res) => res.data);
};

export const useEFP = ({ ownerAddress }: { ownerAddress: Address }) => {
  const [efp, setEfp] = useState<EFPState>({
    followers: 0,
    following: 0,
    isError: false,
    isFetching: true,
  });

  useEffect(() => {
    const fetchEfpData = async (princial: Address) => {
      let efpList: string | undefined = undefined;
      let followersCount = 0;
      let followingCount = 0;
      const listData = await getEfpLists(princial);
      if (listData && listData.primary_list) {
        efpList = listData.primary_list;
        const efpStats = await getEfpStats(efpList);
        followersCount = efpStats.followers_count;
        followingCount = efpStats.following_count;
      }
      setEfp({
        followers: followersCount,
        following: followingCount,
        isError: false,
        isFetching: false,
        primaryList: efpList,
      });
    };

    if (ownerAddress) {
      fetchEfpData(ownerAddress);
    }
  }, [ownerAddress]);

  return efp;
};
