import { Tree, ITreeNode, Dir } from "./tree";

const RED = "RED",
  BLACK = "BLACK";
function isRed<T>(node: ITreeNode<T>) {
  return node !== null && node.red;
}

function makeNode<T>(data: T): ITreeNode<T> {
  // @ts-ignore
  return {
    data: data,
    red: true,
    left: null,
    right: null,
  };
}

function insert<T>(root: ITreeNode<T>, data: T, compare: (a: T, b: T) => number) {
  if (!root) {
    return makeNode(data);
  } else {
    const cmp = compare(data, root.data);
    if (cmp) {
      const dir = cmp === -1 ? "left" : "right";
      const otherDir = dir === "left" ? "right" : "left";
      root[dir] = insert(root[dir] as ITreeNode<T>, data, compare);
      const node = root[dir] as ITreeNode<T>;

      if (isRed(node)) {
        const sibling = root[otherDir] as ITreeNode<T>;
        if (isRed(sibling)) {
          /* Case 1 */
          root.red = true;
          node.red = false;
          sibling.red = false;
        } else {
          if (isRed(node[dir] as ITreeNode<T>)) {
            // @ts-ignore
            root = rotateSingle(root, otherDir);
          } else if (isRed(node[otherDir] as ITreeNode<T>)) {
            // @ts-ignore
            root = rotateDouble(root, otherDir);
          }
        }
      }
    }
  }
  return root;
}

function rotateSingle<T>(root: ITreeNode<T>, dir: Dir) {
  const otherDir = dir === "left" ? "right" : "left";
  const save = root[otherDir];
  // @ts-ignore
  root[otherDir] = save[dir];
  // @ts-ignore
  save[dir] = root;
  root.red = true;
  // @ts-ignore
  save.red = false;
  return save;
}

function rotateDouble<T>(root: ITreeNode<T>, dir: Dir) {
  const otherDir = dir === "left" ? "right" : "left";
  root[otherDir] = rotateSingle(root[otherDir] as ITreeNode<T>, otherDir);
  return rotateSingle(root, dir);
}

function remove<T>(root: ITreeNode<T>, data: T, done: { done: boolean }, compare: (a: T, b: T) => number) {
  if (!root) {
    done.done = true;
  } else {
    if (compare(data, root.data) === 0) {
      if (!root.left || !root.right) {
        const save = root[!root.left ? "right" : "left"] as ITreeNode<T>;
        /* Case 0 */
        if (isRed(root)) {
          done.done = true;
        } else if (isRed(save)) {
          save.red = false;
          done.done = true;
        }
        return save;
      } else {
        let heir = root.right;
        let p: ITreeNode<T>;
        while (heir.left !== null) {
          p = heir;
          // @ts-ignore
          heir = heir.left;
        }
        // @ts-ignore
        if (p) {
          p.left = null;
        }
        root.data = heir.data;
        data = heir.data;
      }
    }
    const dir: Dir = compare(data, root.data) === -1 ? "left" : "right";
    root[dir] = remove(root[dir] as ITreeNode<T>, data, done, compare);
    if (!done.done) {
      root = removeBalance(root, dir, done);
    }
  }
  return root;
}

function removeBalance<T>(root: ITreeNode<T>, dir: Dir, done: { done: boolean }) {
  const notDir = dir === "left" ? "right" : "left";
  let p = root;
  let s = p[notDir] as ITreeNode<T>;
  if (isRed(s)) {
    // @ts-ignore
    root = rotateSingle(root, dir);
    s = p[notDir] as ITreeNode<T>;
  }
  if (s !== null) {
    // @ts-ignore
    if (!isRed(s.left) && !isRed(s.right)) {
      if (isRed(p)) {
        done.done = true;
      }
      p.red = false;
      s.red = true;
    } else {
      const save = p.red,
        newRoot = root === p;
      // @ts-ignore
      p = (isRed(s[notDir] as ITreeNode<T>) ? rotateSingle : rotateDouble)(p, dir);
      p.red = save;
      // @ts-ignore
      p.left.red = p.right.red = false;
      if (newRoot) {
        root = p;
      } else {
        root[dir] = p;
      }
      done.done = true;
    }
  }
  return root;
}

export class RedBlackTree<T> extends Tree<T> {
  insert(data: T) {
    // @ts-ignore
    this.setRoot(insert(this.root, data, this.compare));
    // @ts-ignore
    this.root.red = false;
  }

  remove(data: T) {
    const done = { done: false };
    // @ts-ignore
    const root = remove(this.root, data, done, this.compare);
    if (root !== null) {
      root.red = false;
    }
    this.setRoot(root);
    return data;
  }
  __printNode(node: ITreeNode<T>, level: number) {
    //console.log(level);
    const str: string[] = [];
    if (!node) {
      str.push("\t".repeat(level));
      str.push("~");
      console.log(str.join(""));
    } else {
      // @ts-ignore
      this.__printNode(node.right, level + 1);
      str.push("\t".repeat(level));
      str.push((node.red ? RED : BLACK) + ":" + node.data + "\n");
      console.log(str.join(""));
      // @ts-ignore
      this.__printNode(node.left, level + 1);
    }
  }
}
