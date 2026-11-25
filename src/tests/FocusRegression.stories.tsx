import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "../components/Modal";
import { Popover } from "../components/Popover";

/**
 * 회귀 검사용 — 사이드바에 보이지 않는다(`!dev`). `pnpm ds:verify-interact` 가 연다.
 *
 * 부모가 상태를 들고 콜백을 **인라인으로** 넘기는, 가장 흔한 사용법이다. 입력할 때마다 부모가
 * 다시 렌더되어 새 콜백이 내려온다. 오버레이가 콜백에 의존하는 effect 로 포커스를 옮기면
 * 한 글자마다 포커스가 튀어 나머지 글자가 입력칸에 들어가지 않는다.
 */
const meta = {
  title: "Tests/포커스 유지",
  tags: ["!dev"],
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalWithForm() {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("");
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="이름 바꾸기">
      <input aria-label="새 이름" value={name} onChange={(e) => setName(e.target.value)} />
    </Modal>
  );
}

export const ModalInlineOnClose: Story = {
  render: () => <ModalWithForm />,
};

function PopoverWithForm() {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState("");
  return (
    <Popover open={open} onOpenChange={(next) => setOpen(next)} trigger="필터">
      {/* 첫 포커스 대상이 입력칸이 아니어야 튀는 것이 드러난다. */}
      <button type="button" onClick={() => setQ("")}>
        초기화
      </button>
      <input aria-label="검색어" value={q} onChange={(e) => setQ(e.target.value)} />
    </Popover>
  );
}

export const PopoverInlineOnOpenChange: Story = {
  render: () => <PopoverWithForm />,
};
