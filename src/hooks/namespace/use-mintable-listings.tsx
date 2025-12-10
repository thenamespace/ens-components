import { useCallback, useEffect, useState } from "react";
import debouce from "lodash/debounce";
import {
  ListingSuggestion,
  ListingSuggestionRequest,
} from "@/types/list-manager";
import { useListingManager } from "./use-listing-manager";

export const useListingSuggestions = (params: ListingSuggestionRequest) => {
  const listManager = useListingManager();
  const [state, setState] = useState<{
    isFetching: boolean;
    isError: boolean;
    errorMessage?: string;
    items: ListingSuggestion[];
  }>({
    isError: false,
    isFetching: false,
    items: [],
  });

  useEffect(() => {

    setState({
      ...state,
      isFetching: true,
      isError: false,
    });
    fetchSuggestionsDebounced(params)
  }, [
    params.minterAddress,
    params.nameNetwork,
    params.listingType,
    params.minterAddress,
    params.label,
    params.parentName,
  ]);

  const fetchSuggestionsDebounced = useCallback(
    debouce((params: ListingSuggestionRequest) => {
      listManager.getListingSuggestions(params)
        .then((res) => {
          setState({ isError: false, items: res.items, isFetching: false });
        })
        .catch((err) => {
          setState({
            isError: true,
            errorMessage: err,
            isFetching: false,
            items: [],
          });
        });
    }, 600),
    [])

    return state;
};