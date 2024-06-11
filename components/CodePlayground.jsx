import React, { useState } from "react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import OpenAI from "openai";
import styles from "./counters.module.css";
import Modal from "./Modal";

const apiKey = process.env.NEXT_PUBLIC_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      {/* <button onClick={handleClick} className={styles.counter}>
        Clicked {count} times
      </button> */}
    </div>
  );
}

function CodePlayground() {
  const [code, setCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

string public name = "AuditAI Token";
string public symbol = "AAT";
uint8 public decimals = 18;
uint256 public totalSupply = 1000000 * 10 ** uint256(decimals);
mapping(address => uint256) public balanceOf;
ma
constructor() {
    balanceOf[msg.sender] = totalSupply;
}

function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    require(_value <= balanceOf[_from], "Insufficient balance");
    require(_value <= allowance[_from][msg.sender], "Allowance exceeded");

    emit SmartContractAudited(msg.sender, contractCode, auditReport);
}
}`);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const handleDebugCode = async () => {
    setLoading(true);
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `You are an AI code auditor. Here is a code snippet: ${code}. 
            Please analyze this code, identify any errors, and provide the corrected version in the following JSON format:
            
            {
              "errors": [
                "description of error 1",
                "description of error 2",
                ...
              ],
              "corrected_code": "the corrected code here"
            }
            
            If there are no errors, return:
            
            {
              "errors": [],
              "corrected_code": "the original code"
            }`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      const response = chatCompletion.choices[0].message.content;
      const results = JSON.parse(response);

      if (results.errors.length === 0) {
        setModalContent("No errors found!");
        setModalIsOpen(true);
      } else {
        setCode(results.corrected_code);
        setModalContent(
          `Errors were found and corrected in the following parts of the code:\n\n${results.errors.join(
            "\n"
          )}`
        );
        setModalIsOpen(true);
      }
    } catch (error) {
      console.error("Error checking code:", error);
      setModalContent("An error occurred while processing your code.");
      setModalIsOpen(true);
    }
    setLoading(false);
  };

  return (
    <div>
      <LiveProvider code={code} onChange={setCode}>
        <LiveEditor />
        <LivePreview />
        {/* <LiveError /> */}
      </LiveProvider>
      <button
        onClick={handleDebugCode}
        disabled={loading}
        className={styles.button}
      >
        {loading ? "Debugging..." : "Debug"}
      </button>
      <Modal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)}>
        <h2>Debug Results</h2>
        <p>{modalContent}</p>
        <button onClick={() => setModalIsOpen(false)}>Close</button>
      </Modal>
    </div>
  );
}

export default function MyApp() {
  return (
    <div>
      <MyButton />
      <CodePlayground />
    </div>
  );
}
