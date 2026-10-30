// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { FichaSecao, FichaSecoes } from "@/components/crm/ficha-secoes";

afterEach(cleanup);

it("trocar seção mantém o mesmo campo montado e seu rascunho local", () => {
  render(<FichaSecoes>
    <FichaSecao titulo="Identificação e responsabilidade"><input aria-label="Campo A" defaultValue="" /></FichaSecao>
    <FichaSecao titulo="Objetivo e linha preliminar"><input aria-label="Campo B" defaultValue="" /></FichaSecao>
  </FichaSecoes>);
  const campo = screen.getByLabelText("Campo A") as HTMLInputElement;
  fireEvent.change(campo, { target: { value: "rascunho não salvo" } });
  fireEvent.click(screen.getByRole("button", { name: /Objetivo e linha preliminar/ }));
  expect(campo.closest("[hidden]")).not.toBeNull();
  expect(screen.getByLabelText("Campo B").closest("[hidden]")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Identificação e responsabilidade/ }));
  expect(screen.getByLabelText("Campo A")).toBe(campo);
  expect(campo.value).toBe("rascunho não salvo");
});