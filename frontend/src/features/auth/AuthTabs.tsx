import { Tab, TabList, TabPanel, Tabs } from "../../components/Tabs";
import { CodeLoginPanel } from "./CodeLoginPanel";
import { AUTH_COPY } from "./copy";
import { TokenLoginPanel } from "./TokenLoginPanel";
import type { useCodeLogin } from "./useCodeLogin";
import type { useTokenLogin } from "./useTokenLogin";
import styles from "./AuthTabs.module.css";

export type AuthMethod = "token" | "code";
const METHODS: readonly AuthMethod[] = ["token", "code"];

export interface AuthTabsProps {
  method: AuthMethod;
  onMethodChange: (method: AuthMethod) => void;
  tokenLogin: ReturnType<typeof useTokenLogin>;
  codeLogin: ReturnType<typeof useCodeLogin>;
}

export function AuthTabs({ method, onMethodChange, tokenLogin, codeLogin }: AuthTabsProps) {
  return (
    <Tabs value={method} onValueChange={onMethodChange} className={styles.root}>
      <TabList aria-label={AUTH_COPY.tabsLabel} values={METHODS}>
        <Tab value="token">{AUTH_COPY.tabToken}</Tab>
        <Tab value="code">{AUTH_COPY.tabCode}</Tab>
      </TabList>

      <TabPanel value="token">
        <TokenLoginPanel view={tokenLogin.view} onRetry={tokenLogin.retry} />
      </TabPanel>

      <TabPanel value="code">
        <CodeLoginPanel
          view={codeLogin.view}
          botUrl={tokenLogin.botUrl}
          botUrlPending={tokenLogin.view.status === "loading"}
          onSubmit={codeLogin.submit}
          onEdit={codeLogin.clearError}
        />
      </TabPanel>
    </Tabs>
  );
}
