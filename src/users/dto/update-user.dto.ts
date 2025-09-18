import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";

// PartialType() is to make all the column optional
export class UpdateUserDto extends PartialType(CreateUserDto){}
