import React, { useEffect } from "react";
import { Components } from "./types";
import { InputComponent } from "../input";
import { SubmitButtonComponent } from "../submit-button";
import { MachineStates } from "../submit-button/types";
import { withLatestFrom } from "rxjs/operators";
import { IWs } from "../../services/ws";

const minNicknameLength = 6;
const minPasswordLength = 12;

export class LoginFormComponent {
  public components: Components;
  private ws: IWs;

  constructor(ws: IWs) {
    const nickname = new InputComponent(
      s => s.data.length >= minNicknameLength,
      s =>
        `Nickname is ${
          s.data.length
        } characters and needs to be at least ${minNicknameLength}.`
    );

    const password = new InputComponent(
      s => s.data.length >= minPasswordLength,
      s =>
        `Password is currently ${
          s.data.length
        } characters and needs to be at least ${minPasswordLength}.`
    );

    const submitButton = new SubmitButtonComponent([
      nickname.validationComponent,
      password.validationComponent
    ]);

    this.components = {
      nickname,

      password,

      submitButton
    };
    this.ws = ws;
  }

  public createView() {
    const Nickname = this.components.nickname.createView("text");
    const Password = this.components.password.createView("password");
    const SubmitButton = this.components.submitButton.createView();

    return () => {
      useEffect(() => {
        const subscription = this.components.submitButton.stateStream
          .pipe(
            withLatestFrom(
              this.components.nickname.stateStream,
              this.components.password.stateStream,
              (submitState, nickname, password) => ({
                submitState,
                formState: {
                  nickname,
                  password
                }
              })
            )
          )
          .subscribe(state => {
            if (state.submitState.machine === MachineStates.Submitting) {
              this.ws.publish("login", state.formState);

              this.components.submitButton.machine[
                MachineStates.Submitting
              ].actions.done.trigger();
            }
          });
        return () => {
          subscription.unsubscribe();
        };
      }, []);

      return (
        <div>
          <p className="text-info">
            If you don't have a login, a new one will be created for you the
            first time.
          </p>
          <form>
            <div className="form-group">
              <label htmlFor="nickname">Nickname</label>
              <Nickname />
              <label htmlFor="password">Password</label>
              <Password />
            </div>
            <div className="form-group text-right">
              <SubmitButton />
            </div>
          </form>
        </div>
      );
    };
  }
}
