export default (users) => {
  const sorted = users.sort((u1, u2) => u2.followers - u1.followers)
  return sorted.length > 0 ? sorted[0].login : null
}
