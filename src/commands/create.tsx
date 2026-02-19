// Create command - launches the interactive wizard
import React from "react";
import { render } from "ink";
import { Wizard } from "../components/Wizard.js";

export async function createCommand(): Promise<void> {
  const { waitUntilExit } = render(<Wizard />);
  await waitUntilExit();
}
