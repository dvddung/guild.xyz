import { Tab, TabList, TabPanel, TabPanels, TabProps, Tabs } from "@chakra-ui/react"
import {
  RoleTypeToAddTo,
  useAddRewardContext,
} from "components/[guild]/AddRewardContext"
import RoleSelector from "components/[guild]/RoleSelector"
import useGuild from "components/[guild]/hooks/useGuild"
import useRoleGroup from "components/[guild]/hooks/useRoleGroup"
import SetRequirements from "components/create-guild/Requirements"
import rewards, { PlatformAsRewardRestrictions } from "platforms/rewards"
import { useFormContext, useWatch } from "react-hook-form"
import { PlatformName } from "types"

type Props = {
  selectedPlatform: PlatformName
  isRoleSelectorDisabled?: boolean
}

const TAB_STYLE_PROPS: TabProps = {
  noOfLines: 1,
  whiteSpace: "nowrap",
  display: "block",
}

const SelectRoleOrSetRequirements = ({ isRoleSelectorDisabled }: Props) => {
  const { roles, guildPlatforms } = useGuild()
  const group = useRoleGroup()
  const data = useWatch({ name: `rolePlatforms.0` })

  const existingGuildPlatform = guildPlatforms?.find(
    (gp) =>
      gp.platformId === data?.guildPlatform?.platformId &&
      gp.platformGuildId === data?.guildPlatform?.platformGuildId
  )

  const alreadyUsedRoles = new Set(
    existingGuildPlatform
      ? roles
          ?.filter((role) =>
            role.rolePlatforms?.some(
              (rp) => rp.guildPlatformId === existingGuildPlatform.id
            )
          )
          ?.map((role) => role.id) ?? []
      : []
  )

  const availableRoles = roles.filter((role) => !alreadyUsedRoles.has(role.id))

  const relevantRoles = group
    ? availableRoles.filter((role) => role.groupId === group.id)
    : availableRoles.filter((role) => !role.groupId)

  const { register, unregister, setValue } = useFormContext()
  const { selection, activeTab, setActiveTab } = useAddRewardContext()

  const erc20Type: "REQUIREMENT_AMOUNT" | "STATIC" | null =
    selection === "ERC20" ? data?.dynamicAmount.operation.input.type : null

  const handleChange = (value: RoleTypeToAddTo) => {
    /**
     * This custom ERC20 condition might not be needed cause we've disabled the
     * switcher since then, but maybe it will be in the future so leaving it now
     */
    if (erc20Type !== "REQUIREMENT_AMOUNT") {
      if (value === RoleTypeToAddTo.EXISTING_ROLE) {
        unregister("requirements")
      } else {
        register("requirements", { value: [{ type: "FREE" }] })
        unregister("roleIds")
      }
    }
    setActiveTab(value)
  }

  const { asRewardRestriction } = rewards[selection]

  return (
    <Tabs
      isLazy
      size="sm"
      isFitted
      variant="solid"
      colorScheme="indigo"
      index={isRoleSelectorDisabled ? RoleTypeToAddTo.NEW_ROLE : activeTab}
      onChange={handleChange}
    >
      <TabList mt="6" mb="7">
        <Tab
          {...TAB_STYLE_PROPS}
          isDisabled={isRoleSelectorDisabled}
        >{`Add to existing role${
          asRewardRestriction === PlatformAsRewardRestrictions.MULTIPLE_ROLES
            ? "s"
            : ""
        }`}</Tab>
        <Tab {...TAB_STYLE_PROPS}>Create new role (set requirements)</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <RoleSelector
            isGuildPlatformAlreadyInUse={!!existingGuildPlatform}
            allowMultiple={
              selection !== "ERC20"
                ? asRewardRestriction === PlatformAsRewardRestrictions.MULTIPLE_ROLES
                : erc20Type === "STATIC"
                ? true
                : false
            }
            roles={relevantRoles}
            onChange={(selectedRoleIds) => setValue("roleIds", selectedRoleIds)}
          />
        </TabPanel>
        <TabPanel>
          <SetRequirements titleSize="md" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default SelectRoleOrSetRequirements
