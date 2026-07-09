import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Explorer } from "@/components/explorer/Explorer";
import { Editor } from "@/components/editor/Editor";
import { Chat } from "@/components/chat/Chat";
import { GitPanel } from "@/components/git-panel/GitPanel";
import { Terminal } from "@/components/terminal/Terminal";
import { ContextPanel } from "@/components/context-panel/ContextPanel";

export function ForgeLayout() {
  const [activeFile, setActiveFile] = useState<string | null>(null);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b px-3 py-1.5">
        <span className="forge-brand-glow h-2 w-2 rounded-full bg-primary" />
        <span className="text-sm font-semibold forge-accent-text">LUNA Forge</span>
        <span className="text-xs text-muted-foreground">MVP-01</span>
      </header>

      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={55} minSize={25}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={12}>
              <Explorer activePath={activeFile} onSelectFile={setActiveFile} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80} minSize={30}>
              <Editor openPath={activeFile} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={20} minSize={10}>
          <Chat />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25} minSize={12}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={22} minSize={15}>
              <ContextPanel />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={38} minSize={20}>
              <GitPanel />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={20}>
              <Terminal />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
