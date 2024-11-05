import {
  addressField,
  FieldParser,
  floatField,
  numberField,
  validateInput,
} from "@/src/app/api/tools/validate";
import { Address, zeroAddress } from "viem";

interface Input {
  int: number;
  float: number;
  address: Address;
}

const parsers: FieldParser<Input> = {
  int: numberField,
  float: floatField,
  address: addressField,
};

describe("field validation", () => {
  it("ERC20 Input success", async () => {
    const search = new URLSearchParams(
      `int=123&float=0.45&address=${zeroAddress}`,
    );
    const input = validateInput<Input>(search, parsers);
    expect(input).toStrictEqual({
      int: 123,
      float: 0.45,
      address: zeroAddress,
    });
  });
  it("ERC20 Input fail", async () => {
    const search = new URLSearchParams(`float=0.45&address=${zeroAddress}`);
    expect(() => validateInput<Input>(search, parsers)).toThrow(
      "Missing required field: 'int'",
    );
    search.set("int", "poop");
    expect(() => validateInput<Input>(search, parsers)).toThrow(
      "Invalid Integer field 'int': Not a number",
    );
    search.set("int", "1");
    search.set("address", "0x12");
    expect(() => validateInput<Input>(search, parsers)).toThrow(
      "Invalid Address field 'address': 0x12",
    );

    const search2 = new URLSearchParams(
      "int=11155111&float=0.069&address=0xDcf56F5a8Cc380f63b6396Dbddd0aE9fa605BeeE",
    );
    const input = validateInput<Input>(search2, parsers);
    expect(input).toStrictEqual({
      int: 11155111,
      float: 0.069,
      address: "0xDcf56F5a8Cc380f63b6396Dbddd0aE9fa605BeeE",
    });
  });
});
