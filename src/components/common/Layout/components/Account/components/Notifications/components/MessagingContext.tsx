import { createContext, useContext } from "react"
import { useWeb3InboxSubscription } from "./web3Inbox"
import { useSubscribeXmtp, useXmtpAccessChecking } from "./xmtp"

const messagingContext = createContext<
  ReturnType<typeof useSubscribeXmtp> &
    ReturnType<typeof useWeb3InboxSubscription> &
    ReturnType<typeof useXmtpAccessChecking>
>(undefined)

export const useMessagingContext = () => useContext(messagingContext)

export const MessagingWrapper = ({ children }) => {
  const web3InboxSubscription = useWeb3InboxSubscription()
  const checkXmtpAccess = useXmtpAccessChecking()

  const xmtpSubscription = useSubscribeXmtp()

  return (
    <messagingContext.Provider
      value={{
        ...web3InboxSubscription,
        ...xmtpSubscription,
        ...checkXmtpAccess,
      }}
    >
      {children}
    </messagingContext.Provider>
  )
}