"use client"

import { BlockedProfilesList } from "./BlockedProfiles.List"
import { BlockedProfilesResults } from "./BlockedProfiles.Results"
import { BlockedProfilesSearch } from "./BlockedProfiles.Search"

export const BlockedProfiles = {
  Search: BlockedProfilesSearch,
  // Results é exportado porque é puro (props-driven): a Search o compõe, e ele
  // pode ser montado isolado para inspecionar os cinco estados da busca.
  Results: BlockedProfilesResults,
  List: BlockedProfilesList,
}
