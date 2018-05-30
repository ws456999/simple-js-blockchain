
const SHA256 = require('crypto-js/sha256')

/**
 * 区块 class
 *
 * @class Block
 */
class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.previousHash = previousHash
    this.timestamp = timestamp
    this.transactions = transactions
    this.hash = this.calculateHash()
    this.nonce = 0
  }

  /**
   * sha256算出区块hash
   *
   * @returns hash
   * @memberof Block
   */
  calculateHash() {
    return SHA256(
      this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString()
  }

  /**
   * 通过difficulty 来加大开矿的难度，加了一个nonce的字段来实现这个概念，非常厉害
   *
   * @param {any} difficulty
   * @memberof Block
   */
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`BLOCK MINED: ${this.hash}`)
  }
}

/**
 * 交易class
 *
 * @class Transaction
 */
class Transaction {
  constructor (fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
  }
}

/**
 * 区块链class
 *
 * @class Blockchain
 */
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    // 挖矿难度（就是指定hash的前置0的个数，太天才了）
    this.difficulty = 2

    // 在区块产生之间存储交易的地方
    this.pendingTransactions = []
    // 挖矿回报
    this.mineReward = 100
  }

  /**
   * 上帝区块（第一个区块）
   *
   * @returns Block
   * @memberof Blockchain
   */
  createGenesisBlock() {
    return new Block(0, '01/01/2017', 'Genesis block', '0')
  }

  /**
   * 取货最新一个区块
   *
   * @returns Block
   * @memberof Blockchain
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  /**
   * 新增交易，并加入到带确认池中
   *
   * @param {any} transaction
   * @memberof Blockchain
   */
  createTransaction(transaction){
    // 这里应该有些校验
    this.pendingTransactions.push(transaction)
  }

  /**
   * 开采待交易池中的区块
   *
   * @param {any} miningRewardAddress
   * @memberof Blockchain
   */
  minePendingTransactions(miningRewardAddress) {
    // 用所有待交易来创建新的区块并且开挖
    let block = new Block(Date.now(), this.pendingTransactions)
    block.mineBlock(this.difficulty)

    // 讲新挖的block加入到链上
    this.chain.push(block)

    // 重置待处理交易列表并发送奖励
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.mineReward)
    ]
  }

  /**
   * 获取某个地址的余额
   *
   * @param {any} address
   * @returns balance of address(number)
   * @memberof Blockchain
   */
  getBalanceOfAddress (address) {
    let balance = 0
    for (const block of this.chain) {
      for (const trans of block.transactions) {

        // 如果地址是发起方 -> 减少余额
        if (trans.fromAddress === address) {
          balance -= trans.amount
        }

        // 如果地址是接收方 -> 增加余额
        if (trans.toAddress === address) {
          balance += trans.amount
        }
      }
    }

    return balance
  }

  /**
   * 判断区块是否合法
   *
   * @returns Boolean
   * @memberof Blockchain
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }
    return true
  }
}

// 测试运行

let testCoin = new Blockchain();
testCoin.createTransaction(new Transaction('address1', 'address2', 100));
testCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
testCoin.minePendingTransactions('miner-address');

// 矿工的奖励在下次开矿才会获得，所以这次的balance是0
console.log('\nBalance of xavier is', testCoin.getBalanceOfAddress('miner-address'));

console.log('\n Starting the miner again...');
testCoin.minePendingTransactions('miner-address');

console.log('\nBalance of xavier is', testCoin.getBalanceOfAddress('miner-address'));