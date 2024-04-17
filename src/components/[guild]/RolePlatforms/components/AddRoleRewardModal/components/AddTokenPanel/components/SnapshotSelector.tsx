import {
  Center,
  Flex,
  FormControl,
  FormLabel,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import CreateSnapshotModal from "components/[guild]/leaderboard/Snapshots/CreateSnapshotModal"
import Button from "components/common/Button"
import ControlledSelect from "components/common/ControlledSelect"
import { useSnapshot, useSnapshots } from "hooks/useSnapshot"
import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import Star from "static/icons/star.svg"
import { PlatformGuildData, PlatformType, SelectOption } from "types"
import ExistingPointsTypeSelect from "../../AddPointsPanel/components/ExistingPointsTypeSelect"

const SnapshotSelector = () => {
  const { onClose, onOpen, isOpen } = useDisclosure()

  const { guildPlatforms } = useGuild()

  const existingPointsRewards = guildPlatforms?.filter(
    (gp) => gp.platformId === PlatformType.POINTS
  )

  const { setValue: setRootValue } = useFormContext()
  const setRequirement = (req: any) => setRootValue("requirements", [req])

  const selectedPointsId = useWatch({ name: "data.guildPlatformId" })

  const {
    snapshots,
    isSnapshotsLoading,
    mutate: refetchSnapshots,
  } = useSnapshots(selectedPointsId)
  const selectedSnapshotId = useWatch({ name: "snapshotId" })

  const handleCreateSuccess = (createdId: number) => {
    refetchSnapshots().then(() => {
      setRootValue("snapshotId", createdId)
    })
    onClose()
  }

  const { snapshot, isSnapshotLoading } = useSnapshot(
    selectedPointsId,
    selectedSnapshotId
  )

  const transformSnapshotData = (
    snapshotData: { address: string; value: number }[]
  ) => {
    return snapshotData.map((data) => {
      return { key: data.address, value: data.value }
    })
  }

  useEffect(() => {
    if (!snapshot) return
    const transformedData = transformSnapshotData(snapshot.data)

    setRequirement({
      type: "GUILD_SNAPSHOT",
      data: {
        snapshot: transformedData,
        isHidden: false,
        guildPlatformId: selectedPointsId,
      },
    })
  }, [snapshot])

  const getPointPlatform = (guildPlatformId: number) => {
    return guildPlatforms.find((gp) => gp.id === guildPlatformId)
      ?.platformGuildData as PlatformGuildData["POINTS"]
  }

  const options: SelectOption<number>[] = !!snapshots
    ? snapshots.map((shot) => {
        return {
          label: `${shot.name} (${
            getPointPlatform(shot.guildPlatformId)?.name || "points"
          })`,
          value: shot.id,
          img: getPointPlatform(shot.guildPlatformId)?.imageUrl || (
            <Center boxSize={5}>
              <Star />
            </Center>
          ),
        }
      })
    : []

  return (
    <>
      <ExistingPointsTypeSelect
        existingPointsRewards={existingPointsRewards}
        selectedExistingId={selectedPointsId}
        mb={3}
      />

      {snapshots?.length === 0 ? (
        <>
          <Button
            w="full"
            boxSizing="border"
            onClick={onOpen}
            mt={2}
            isDisabled={!selectedPointsId}
          >
            Create snapshot
          </Button>

          <CreateSnapshotModal
            onClose={onClose}
            onSuccess={handleCreateSuccess}
            isOpen={isOpen}
          />
        </>
      ) : (
        <>
          <FormControl>
            <Flex justifyContent={"space-between"} w="full">
              <FormLabel>Select snapshot</FormLabel>
              <Button
                size="xs"
                variant="ghost"
                borderRadius={"lg"}
                onClick={onOpen}
                isDisabled={!selectedPointsId}
              >
                <Text colorScheme={"gray"}>Create new</Text>
              </Button>
            </Flex>
            <ControlledSelect
              isDisabled={!selectedPointsId}
              name={`snapshotId`}
              options={options}
            ></ControlledSelect>
            <CreateSnapshotModal
              onClose={onClose}
              onSuccess={handleCreateSuccess}
              isOpen={isOpen}
            />
          </FormControl>
        </>
      )}
    </>
  )
}

export default SnapshotSelector