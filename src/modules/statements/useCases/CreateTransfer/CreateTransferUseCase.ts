import {inject, injectable} from "tsyringe";
import { IStatementsRepository } from "../../../statements/repositories/IStatementsRepository";
import { CreateStatementError } from "../../../statements/useCases/createStatement/CreateStatementError";
import { ICreateStatementDTO } from "../../../statements/useCases/createStatement/ICreateStatementDTO";

import {IUsersRepository} from "../../../users/repositories/IUsersRepository";


@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, sender_id, type, amount, description }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    const sendUser = await this.usersRepository.findById(String(sender_id));
    if (!sendUser) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sendUser.id });
    if (balance < amount) {
      throw new CreateStatementError.InsufficientFunds()
    }

    return this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description
    });
  }
}
